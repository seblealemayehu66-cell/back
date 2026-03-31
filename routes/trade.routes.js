import express from "express";
import Trade from "../models/Trade.js";
import Settings from "../models/Settings.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

/* ================= PLACE TRADE ================= */

router.post("/", authMiddleware, async (req, res) => {
  try {
    let { pair, direction, amount, deliveryTime } = req.body;

    // FORCE NUMBER
    deliveryTime = Number(deliveryTime);
    amount = Number(amount);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // CHECK BALANCE
    if (!user.balance.USDT || amount > user.balance.USDT) {
      return res.status(400).json({ message: "Insufficient USDT balance" });
    }

    // DEDUCT BALANCE IMMEDIATELY
    user.balance.USDT -= amount;
    await user.save();

    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({ tradingOpen: true });

    // PROFIT PERCENTAGE BASED ON TIME
    let percentage;

    switch (deliveryTime) {
      case 30:
        percentage = 12;
        break;
      case 60:
        percentage = 15;
        break;
      case 120:
        percentage = 20;
        break;
      case 300:
        percentage = 25;
        break;
      default:
        percentage = 15;
    }

    const entryPrice = Number((60000 + Math.random() * 2000).toFixed(2));

    // CREATE TRADE
    const trade = await Trade.create({
      userId: user._id,
      coin: "USDT",
      pair,
      direction,
      amount,
      entryPrice,
      deliveryTime,
      percentage,
      status: "pending",
      result: "pending",
      profitLoss: 0
    });

    /* ================= AUTO CLOSE TRADE ================= */

    setTimeout(async () => {
      try {
        const t = await Trade.findById(trade._id);
        if (!t || t.status === "closed") return;

        const u = await User.findById(t.userId);
        if (!u) return;

        // 🔥 REAL MARKET SIMULATION
        const marketMoveUp = Math.random() > 0.5;

        let win = false;

        if (t.direction === "up" && marketMoveUp) win = true;
        if (t.direction === "down" && !marketMoveUp) win = true;

        let profitLoss = win
          ? (t.amount * t.percentage) / 100
          : -(t.amount * t.percentage) / 100;

        // UPDATE TRADE
        t.profitLoss = profitLoss;
        t.status = "closed";
        t.result = win ? "win" : "loss";
        t.closedAt = new Date();

        await t.save();

        // UPDATE USER BALANCE
        u.balance.USDT += t.amount + profitLoss;
        await u.save();

        console.log(
          `Trade closed: ${t._id} | ${t.result} | P/L: ${profitLoss}`
        );
      } catch (err) {
        console.error("Auto close error:", err);
      }
    }, deliveryTime * 1000);

    /* ================= RESPONSE ================= */

    res.json({
      message: "Trade placed successfully",
      trade,
      balance: user.balance
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Trade execution failed" });
  }
});

/* ================= GET USER TRADES ================= */

router.get("/", authMiddleware, async (req, res) => {
  try {
    const trades = await Trade.find({
      userId: req.user._id
    }).sort({ createdAt: -1 });

    res.json(trades);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch trades" });
  }
});

export default router;

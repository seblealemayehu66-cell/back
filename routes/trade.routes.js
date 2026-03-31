import express from "express";
import Trade from "../models/Trade.js";
import Settings from "../models/Settings.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

/* ================= HELPER: MARKET RESULT ================= */
const getMarketResult = (direction) => {
  const moveUp = Math.random() > 0.5;

  let win = false;
  if (direction === "up" && moveUp) win = true;
  if (direction === "down" && !moveUp) win = true;

  return win;
};

/* ================= PLACE TRADE ================= */
router.post("/", authMiddleware, async (req, res) => {
  try {
    let { pair, direction, amount, deliveryTime } = req.body;

    amount = Number(amount);
    deliveryTime = Number(deliveryTime);

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.balance.USDT || user.balance.USDT < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct balance immediately
    user.balance.USDT -= amount;
    await user.save();

    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({ tradingOpen: true });

    // Profit %
    let percentage = 15;
    if (deliveryTime === 30) percentage = 12;
    if (deliveryTime === 60) percentage = 15;
    if (deliveryTime === 120) percentage = 20;
    if (deliveryTime === 300) percentage = 25;

    const entryPrice = Number((60000 + Math.random() * 2000).toFixed(2));

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
      profitLoss: 0,
    });

    /* ================= AUTO CLOSE ENGINE ================= */
    setTimeout(async () => {
      try {
        const t = await Trade.findById(trade._id);
        if (!t || t.status === "closed") return;

        const u = await User.findById(t.userId);
        if (!u) return;

        const win = getMarketResult(t.direction);

        const profitLoss = win
          ? (t.amount * t.percentage) / 100
          : -(t.amount * t.percentage) / 100;

        t.profitLoss = profitLoss;
        t.result = win ? "win" : "loss";
        t.status = "closed";
        t.closedAt = new Date();

        await t.save();

        // return balance
        u.balance.USDT += t.amount + profitLoss;
        await u.save();

      } catch (err) {
        console.error("Auto close error:", err);
      }
    }, deliveryTime * 1000);

    /* ================= IMPORTANT FIX ================= */
    // return FULL trade immediately (with initial state)
    res.json({
      message: "Trade placed successfully",
      trade: {
        ...trade.toObject(),
        profitLoss: 0,
        result: "pending",
      },
      balance: user.balance,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Trade execution failed" });
  }
});

/* ================= GET USER TRADES ================= */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const trades = await Trade.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(trades);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch trades" });
  }
});

/* ================= GET SINGLE TRADE (IMPORTANT FIX FOR FRONTEND) */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);

    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }

    res.json(trade);
  } catch (err) {
    res.status(500).json({ message: "Error fetching trade" });
  }
});

export default router;

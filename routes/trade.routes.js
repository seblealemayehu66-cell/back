import express from "express";
import Trade from "../models/Trade.js";
import Settings from "../models/Settings.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

/* ================= PLACE TRADE ================= */

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      coin,
      pair,
      direction,
      amount,
      price,
      deliveryTime
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user.balance[coin] || amount > user.balance[coin]) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // deduct balance immediately
    user.balance[coin] -= amount;
    await user.save();

    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});

    const percentage = settings.profitPercent || 15;

    // entry price (fake market)
    const entryPrice =
      price || Number((60000 + Math.random() * 2000).toFixed(2));

    const trade = await Trade.create({
      userId: user._id,
      coin,
      pair,
      direction,
      amount,
      entryPrice,
      deliveryTime,
      percentage,
      status: "pending"
    });

    /* ================= AUTO CLOSE ================= */

    setTimeout(async () => {
      const t = await Trade.findById(trade._id);
      if (!t || t.status === "closed") return;

      const u = await User.findById(t.userId);

      let profitLoss = 0;
      let closePrice = t.entryPrice;

      // ❌ TRADING CLOSED → ALWAYS LOSE
      if (!settings.tradingOpen) {
        profitLoss = -(t.amount * percentage) / 100;

        closePrice = Number(
          (t.entryPrice - t.entryPrice * (percentage / 1000)).toFixed(2)
        );
      }

      // ✅ TRADING OPEN → ALWAYS PROFIT
      else {
        profitLoss = (t.amount * percentage) / 100;

        closePrice = Number(
          (t.entryPrice + t.entryPrice * (percentage / 1000)).toFixed(2)
        );
      }

      // update trade
      t.closePrice = closePrice;
      t.profitLoss = profitLoss;
      t.status = "closed";
      t.closedAt = new Date();

      await t.save();

      // return balance
      u.balance[t.coin] += t.amount + profitLoss;
      await u.save();

    }, deliveryTime * 1000);

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

/* ================= USER TRADES ================= */

router.get("/", authMiddleware, async (req, res) => {
  const trades = await Trade.find({
    userId: req.user._id
  }).sort({ createdAt: -1 });

  res.json(trades);
});

export default router;

import express from "express";
import Trade from "../models/Trade.js";
import Settings from "../models/Settings.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Place trade
router.post("/", authMiddleware, async (req, res) => {
  const { coin, pair, direction, amount, price, deliveryTime } = req.body;
  const user = req.user;

  if (amount > user.balance[coin]) return res.status(400).json({ message: "Insufficient balance" });

  user.balance[coin] -= amount;
  await user.save();

  const settings = await Settings.findOne();

  const trade = await Trade.create({
    userId: user._id,
    coin,
    pair,
    direction,
    amount,
    price,
    deliveryTime,
    status: "pending",
  });

  // Auto-close trade after deliveryTime
  setTimeout(async () => {
    const t = await Trade.findById(trade._id);
    const u = await Trade.model("User").findById(t.userId);

    let profitLoss = 0;
    if (!settings?.tradingOpen) {
      // Trading closed → always lose
      profitLoss = -t.amount * (t.percentage / 100);
    } else {
      // Random demo result
      const win = Math.random() > 0.5;
      profitLoss = (win && t.direction === "up") || (!win && t.direction === "down")
        ? t.amount * (t.percentage / 100)
        : -t.amount * (t.percentage / 100);
    }

    t.profitLoss = profitLoss;
    t.status = "closed";
    t.closedAt = new Date();
    await t.save();

    u.balance[t.coin] += t.amount + profitLoss - t.amount * (t.fee / 100);
    await u.save();
  }, deliveryTime * 1000);

  res.json({ trade, balance: user.balance });
});

// Get user trades
router.get("/", authMiddleware, async (req, res) => {
  const trades = await Trade.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(trades);
});

export default router;





// routes/trade.routes.js
import express from "express";
import User from "../models/User.js";
import Trade from "../models/Trade.js";
import Settings from "../models/Settings.js";
import { authUser } from "../middleware/auth.js";

const router = express.Router();

router.post("/open", authUser, async (req, res) => {
  const { amount, duration } = req.body;
  const user = await User.findById(req.user.id);
  const settings = await Settings.findOne();

  if (!settings.tradingOpen)
    return res.json({ error: "Trading closed" });

  if (user.balance < amount)
    return res.json({ error: "Insufficient balance" });

  user.balance -= amount;
  await user.save();

  const trade = await Trade.create({
    userId: user._id,
    amount,
    duration
  });

  setTimeout(async () => {
    const profit = amount + (amount * settings.profitPercent) / 100;
    user.balance += profit;
    trade.status = "won";
    trade.profit = profit;
    await user.save();
    await trade.save();
  }, duration * 60000);

  res.json({ success: true });
});

export default router;

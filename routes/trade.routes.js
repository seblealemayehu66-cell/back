// routes/trade.routes.js
import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import Trade from "../models/Trade.js";
import Settings from "../models/Settings.js";

const router = express.Router();

router.use(authMiddleware); // ✅ Protect all routes

router.post("/open", async (req, res) => {
  try {
    const { amount, duration } = req.body;
    const user = req.user;
    const settings = await Settings.findOne();

    if (!settings?.tradingOpen) return res.status(400).json({ error: "Trading closed" });
    if (user.balance < amount) return res.status(400).json({ error: "Insufficient balance" });

    user.balance -= amount;
    await user.save();

    const trade = await Trade.create({
      userId: user._id,
      amount,
      duration,
      status: "open"
    });

    setTimeout(async () => {
      const profit = amount + (amount * settings.profitPercent) / 100;
      user.balance += profit;
      trade.status = "won";
      trade.profit = profit;
      await user.save();
      await trade.save();
    }, duration * 60000);

    res.json({ success: true, balance: user.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;


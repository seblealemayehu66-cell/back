import express from "express";
import User from "../models/User.js";
import Trade from "../models/Trade.js";
import Settings from "../models/Settings.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  const settings = await Settings.findOne();

  const amount = req.body.amount;
  let profit = 0;
  let result = "lose";

  if (settings?.tradingOpen) {
    profit = amount * 0.85;
    user.balance += profit;
    result = "win";
  } else {
    user.balance -= amount;
  }

  await user.save();

  await Trade.create({
    userId: user._id,
    coin: req.body.coinId,
    amount,
    profit,
    result
  });

  res.json({
    balance: user.balance,
    result,
    profit
  });
});

export default router;




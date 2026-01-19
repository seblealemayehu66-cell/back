import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// PLACE TRADE
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { coinId, price, amount } = req.body;

    const user = req.user; // fetched from middleware

    if (amount > user.balance) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    user.balance -= amount;
    await user.save();

    res.json({
      message: "Trade successful",
      balance: user.balance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Trade failed" });
  }
});

export default router;



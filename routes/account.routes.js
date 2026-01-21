// routes/account.routes.js
import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AdminWallet from "../models/AdminWallet.js";

const router = express.Router();

// Auth middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Get user info and balances
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const wallets = await AdminWallet.find({ active: true }); // all active admin wallets
    res.json({ user, wallets });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Withdraw request (simple example)
router.post("/withdraw", authMiddleware, async (req, res) => {
  try {
    const { coin, amount, address } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (amount <= 0 || amount > (user.balance[coin] || 0)) return res.status(400).json({ message: "Insufficient balance" });

    user.balance[coin] -= amount;
    await user.save();

    // Here you would create a transaction record or trigger actual withdrawal logic
    res.json({ message: `Withdrawal of ${amount} ${coin} to ${address} requested successfully` });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

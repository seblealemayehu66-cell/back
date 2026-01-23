import express from "express";
import User from "../models/User.js";
import  adminAuth  from "../middleware/adminAuth.js"; // Protect admin routes

const router = express.Router();

// GET all users (protected)
router.get("/users", authAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude password
    res.json(users);
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Add balance to user (protected)
router.post("/users/add-balance", adminAuth, async (req, res) => {
  const { userId, symbol, amount } = req.body;
  if (!userId || !symbol || !amount) return res.status(400).json({ message: "All fields are required" });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.balance = user.balance || {};
    user.balance[symbol] = (user.balance[symbol] || 0) + Number(amount);

    await user.save();
    res.json({ message: "Balance updated", balance: user.balance });
  } catch (err) {
    console.error("Add balance error:", err);
    res.status(500).json({ message: "Failed to add balance" });
  }
});

export default router;





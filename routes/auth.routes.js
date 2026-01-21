// routes/auth.routes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import Notification from "../models/Notification.js";
import getNextUid from "../middleware/getNextUid.js";
import auth from "../middleware/auth.js"; // user authentication

const router = express.Router();

// ======================
// REGISTER
// ======================
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // check if user already exists
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "User already exists" });

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // generate UID
    const uid = await getNextUid();

    // create user
    const user = await User.create({
      uid,
      username,
      email,
      password: hashed,
      balance: 0, // default balance
    });

    // create default wallets
    const coins = [
      { coin: "Bitcoin", symbol: "BTC" },
      { coin: "Ethereum", symbol: "ETH" },
      { coin: "Solana", symbol: "SOL" },
      { coin: "Dogecoin", symbol: "DOGE" },
      { coin: "BNB", symbol: "BNB" },
    ];

    for (const c of coins) {
      await Wallet.create({
        userId: user._id,
        coin: c.coin,
        symbol: c.symbol,
        balance: 0, // default wallet balance
      });
    }

    // notification for admin
    await Notification.create({
      message: `New user registered: ${email}`,
    });

    res.status(201).json({
      success: true,
      uid: user.uid,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ======================
// LOGIN
// ======================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // find user
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });

    // check password
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Wrong password" });

    // create JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        uid: user.uid,
        username: user.username,
        email: user.email,
        balance: user.balance,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ======================
// GET CURRENT USER
// ======================
router.get("/me", auth, async (req, res) => {
  try {
    const { uid, username, email, balance } = req.user;
    res.json({ uid, username, email, balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;





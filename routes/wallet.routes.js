import express from "express";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/*
  GET /api/wallet
  Returns:
  [
    { coin: "Tether", symbol: "USDT", balance: user.balance },
    { coin: "Bitcoin", symbol: "BTC", balance: wallet.amount },
    ...
  ]
*/
router.get("/", auth, async (req, res) => {
  try {
    // 1️⃣ Get current logged-in user from JWT
    const user = await User.findById(req.userId).select("balance uid");
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2️⃣ Get all wallet coins for the user
    const wallets = await Wallet.find({ userId: req.userId });

    // 3️⃣ Format wallet data
    const walletData = wallets.map((w) => ({
      coin: w.coin,
      symbol: w.coin.slice(0, 3).toUpperCase(),
      balance: w.amount,
    }));

    // 4️⃣ Include USDT from user balance
    const data = [
      {
        coin: "Tether",
        symbol: "USDT",
        balance: user.balance,
      },
      ...walletData,
    ];

    res.json(data);
  } catch (error) {
    console.error("Error fetching wallet:", error);
    res.status(500).json({ message: "Server error fetching wallet" });
  }
});

export default router;




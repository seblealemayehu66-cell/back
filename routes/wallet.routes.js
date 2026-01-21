import express from "express";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    // USDT from user model
    const user = await User.findById(req.userId).select("balance");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // coins from wallet model
    const wallets = await Wallet.find({ userId: req.userId });

    const coins = wallets.map((w) => ({
      coin: w.coin,
      symbol: w.symbol,
      balance: w.balance || 0,
    }));

    // final wallet response
    const data = [
      {
        coin: "Tether",
        symbol: "USDT",
        balance: user.balance,
      },
      ...coins,
    ];

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Wallet fetch failed" });
  }
});

export default router;

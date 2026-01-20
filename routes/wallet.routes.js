import express from "express";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/*
  GET /api/wallet
  returns USDT + coins
*/
router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.userId)
    .select("balance uid");

  const wallets = await Wallet.find({
    userId: req.userId
  });

  const data = [
    {
      coin: "Tether",
      symbol: "USDT",
      balance: user.balance
    },
    ...wallets
  ];

  res.json(data);
});

export default router;

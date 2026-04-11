import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js";
import { getPrices } from "../priceEngine.js";

const router = express.Router();

const ASSETS = ["BTC", "ETH", "SOL", "BNB", "XRP", "USDT"];

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { fromAsset, toAsset, amount } = req.body;

    if (!fromAsset || !toAsset || !amount) {
      return res.status(400).json({ message: "Missing data" });
    }

    if (fromAsset === toAsset) {
      return res.status(400).json({ message: "Cannot swap same asset" });
    }

    if (!ASSETS.includes(fromAsset) || !ASSETS.includes(toAsset)) {
      return res.status(400).json({ message: "Unsupported asset" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if ((user.balance[fromAsset] || 0) < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const prices = getPrices();

    if (!prices[fromAsset] || !prices[toAsset]) {
      return res.status(400).json({ message: "Market not ready yet" });
    }

    // 🔥 REAL MARKET CONVERSION (like exchange)
    const usdValue = amount * prices[fromAsset];
    const receiveAmount = usdValue / prices[toAsset];

    user.balance[fromAsset] -= Number(amount);
    user.balance[toAsset] =
      (user.balance[toAsset] || 0) + receiveAmount;

    await user.save();

    res.json({
      success: true,
      received: receiveAmount,
      price: {
        from: prices[fromAsset],
        to: prices[toAsset],
      },
      balance: user.balance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Swap failed" });
  }
});

export default router;

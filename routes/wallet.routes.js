import express from "express";
import auth from "../middleware/auth.js";
import UserWallet from "../models/Wallet.js";

const router = express.Router();


// ======================
// GET USER WALLETS
// ======================
router.get("/wallets", auth, async (req, res) => {
  try {
    const wallets = await UserWallet.find({
      userId: req.user._id,
    }).sort({ createdAt: 1 });

    res.json(wallets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
  
});
router.post("/wallets/add-balance", auth, async (req, res) => {
  try {
    const { symbol, amount } = req.body;

    if (!symbol || !amount) {
      return res.status(400).json({ message: "Missing data" });
    }

    const wallet = await Wallet.findOne({
      userId: req.user._id,
      symbol
    });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    wallet.balance += Number(amount);
    await wallet.save();

    res.json({
      message: "Balance added",
      wallet
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;





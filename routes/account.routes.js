import express from "express";
import AdminWallet from "../models/AdminWallet.js";
import Deposit from "../models/Deposit.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* =============================
   GET ACTIVE DEPOSIT WALLETS
============================= */
router.get("/wallets", auth, async (req, res) => {
  try {
    const wallets = await AdminWallet.find({ active: true });
    res.json(wallets);
  } catch {
    res.status(500).json({ message: "Failed to load wallets" });
  }
});

/* =============================
   CREATE DEPOSIT REQUEST
============================= */
router.post("/deposit", auth, async (req, res) => {
  try {
    const { coin, network, amount, txid } = req.body;

    const deposit = await Deposit.create({
      userId: req.user.id,
      coin,
      network,
      amount,
      txid
    });

    res.json({
      success: true,
      deposit
    });
  } catch (err) {
    res.status(500).json({ message: "Deposit failed" });
  }
});

export default router;


import express from "express";
import Wallet from "../models/Wallet.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

/**
 * ADD WALLET
 */
router.post("/wallets", adminAuth, async (req, res) => {
  try {
    const { coin, network, address } = req.body;

    const wallet = await Wallet.create({
      coin,
      network,
      address
    });

    res.json({
      success: true,
      wallet
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * UPDATE WALLET
 */
router.put("/wallets/:id", adminAuth, async (req, res) => {
  try {
    const wallet = await Wallet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE WALLET
 */
router.delete("/wallets/:id", adminAuth, async (req, res) => {
  await Wallet.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/**
 * GET ALL WALLETS (ADMIN)
 */
router.get("/wallets", adminAuth, async (req, res) => {
  const wallets = await Wallet.find().sort({ createdAt: -1 });
  res.json(wallets);
});

export default router;

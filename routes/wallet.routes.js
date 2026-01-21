import express from "express";
import Wallet from "../models/Wallet.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * USER FETCH WALLETS AFTER LOGIN
 */
router.get("/", authMiddleware, async (req, res) => {
  const wallets = await Wallet.find({ status: true });

  res.json(wallets);
});

export default router;


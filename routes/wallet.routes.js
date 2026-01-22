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

export default router;




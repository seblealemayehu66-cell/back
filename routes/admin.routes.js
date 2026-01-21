// routes/adminwallet.routes.js
import express from "express";
import AdminWallet from "../models/AdminWallet.js"; // wallet model
import auth from "../middleware/auth.js"; // JWT middleware
import User from "../models/User.js";

const router = express.Router();

// =========================
// ADMIN ROUTES
// =========================

// GET ALL WALLETS (Admin only)
router.get("/wallets", auth, async (req, res) => {
  try {
    // Optional: check if req.user.isAdmin
    const wallets = await AdminWallet.find().sort({ createdAt: -1 }).populate("userid", "username email");
    res.json(wallets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch wallets" });
  }
});

// ADD NEW WALLET (Admin only)
router.post("/wallets/add", auth, async (req, res) => {
  try {
    const { userid, coin, network, address } = req.body;

    if (!userid || !coin || !network || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if wallet already exists for this user
    const exists = await AdminWallet.findOne({ userid, coin, network });
    if (exists) return res.status(400).json({ message: "Wallet already exists for this user" });

    const wallet = await AdminWallet.create({ userid, coin, network, address, active: true, balance: 0 });
    res.json(wallet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add wallet" });
  }
});

// DELETE WALLET (Admin only)
router.delete("/wallets/:id", auth, async (req, res) => {
  try {
    await AdminWallet.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete wallet" });
  }
});

// TOGGLE WALLET ACTIVE / INACTIVE
router.put("/wallets/:id/toggle", auth, async (req, res) => {
  try {
    const wallet = await AdminWallet.findById(req.params.id);
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });

    wallet.active = !wallet.active;
    await wallet.save();
    res.json(wallet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to toggle wallet status" });
  }
});

// =========================
// USER ROUTES
// =========================

// GET wallets for a specific user (only for the logged-in user)
router.get("/user/:userid", auth, async (req, res) => {
  try {
    const { userid } = req.params;

    // Ensure user can only fetch their own wallets
    if (req.user.id !== userid) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const wallets = await AdminWallet.find({ userid, active: true }).select(
      "coin network address balance"
    );

    res.json(wallets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch wallets" });
  }
});

export default router;

// routes/admin.routes.js
import express from "express";
import User from "../models/User.js";
import Settings from "../models/Settings.js";
import AdminWallet from "../models/AdminWallet.js"; // <-- import wallet model
import auth from "../middleware/auth.js"; // optional: protect routes with JWT

const router = express.Router();

// =========================
// USERS ROUTES
// =========================

// GET USERS
router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD BALANCE TO USER
router.post("/add-balance", auth, async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.balance += amount;
    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =========================
// TRADING SETTINGS
// =========================

// OPEN / CLOSE TRADING
router.post("/trade-control", auth, async (req, res) => {
  try {
    const { open } = req.body;
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    settings.tradingOpen = open;
    await settings.save();

    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =========================
// WALLET ROUTES
// =========================

// GET ALL WALLETS
router.get("/wallets", auth, async (req, res) => {
  try {
    const wallets = await AdminWallet.find().sort({ createdAt: -1 });
    res.json(wallets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD NEW WALLET
router.post("/wallets/add", auth, async (req, res) => {
  try {
    const { coin, network, address } = req.body;

    const exists = await AdminWallet.findOne({ address });
    if (exists) return res.status(400).json({ message: "Address already exists" });

    const wallet = await AdminWallet.create({ coin, network, address });
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE WALLET
router.delete("/wallets/:id", auth, async (req, res) => {
  try {
    await AdminWallet.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    res.status(500).json({ message: err.message });
  }
});

export default router;


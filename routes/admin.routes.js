import express from "express";
import User from "../models/User.js";
import AdminWallet from "../models/AdminWallet.js";
import Settings from "../models/Settings.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ====== USERS ======
// Get all users
router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find().select("username email balance _id");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ====== ADD BALANCE ======
router.post("/users/:id/add", auth, async (req, res) => {
  try {
    const { coin, amount } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!coin || !user.balance.hasOwnProperty(coin)) {
      return res.status(400).json({ message: "Invalid coin" });
    }

    user.balance[coin] += Number(amount);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ====== DEDUCT BALANCE ======
router.post("/users/:id/deduct", auth, async (req, res) => {
  try {
    const { coin, amount } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!coin || !user.balance.hasOwnProperty(coin)) {
      return res.status(400).json({ message: "Invalid coin" });
    }

    user.balance[coin] -= Number(amount);
    if (user.balance[coin] < 0) user.balance[coin] = 0;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ====== WALLETS ======
router.get("/wallets", auth, async (req, res) => {
  try {
    const wallets = await AdminWallet.find();
    res.json(wallets);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/wallets", auth, async (req, res) => {
  try {
    const { coin, network, address } = req.body;
    const exists = await AdminWallet.findOne({ address });
    if (exists) return res.status(400).json({ message: "Address exists" });

    const wallet = await AdminWallet.create({ coin, network, address });
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ====== TRADING ======
router.get("/trading-status", auth, async (req, res) => {
  try {
    const settings = (await Settings.findOne()) || (await Settings.create({}));
    res.json({ tradingOpen: settings.tradingOpen });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/trading-status", auth, async (req, res) => {
  try {
    const { tradingOpen } = req.body;
    const settings = (await Settings.findOne()) || (await Settings.create({}));
    settings.tradingOpen = tradingOpen;
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;




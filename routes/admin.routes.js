import express from "express";
import User from "../models/User.js";
import AdminWallet from "../models/AdminWallet.js";
import Settings from "../models/Settings.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// ====== USERS ======
router.get("/users", auth, async (req, res) => {
  const users = await User.find().select("username email balance _id");
  res.json(users);
});

// ADD BALANCE
router.post("/users/:id/add", auth, async (req, res) => {
  const { coin, amount } = req.body; // default USDT
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.balance += Number(amount);
  await user.save();
  res.json(user);
});

// DEDUCT BALANCE
router.post("/users/:id/deduct", auth, async (req, res) => {
  const { coin, amount } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.balance -= Number(amount);
  if (user.balance < 0) user.balance = 0;
  await user.save();
  res.json(user);
});

// ====== WALLETS ======
router.get("/wallets", auth, async (req, res) => {
  const wallets = await AdminWallet.find();
  res.json(wallets);
});

router.post("/wallets", auth, async (req, res) => {
  const { coin, network, address } = req.body;
  const exists = await AdminWallet.findOne({ address });
  if (exists) return res.status(400).json({ message: "Address exists" });

  const wallet = await AdminWallet.create({ coin, network, address });
  res.json(wallet);
});

// ====== TRADING ======
router.get("/trading-status", auth, async (req, res) => {
  const settings = await Settings.findOne() || await Settings.create({});
  res.json({ tradingOpen: settings.tradingOpen });
});

router.post("/trading-status", auth, async (req, res) => {
  const { tradingOpen } = req.body;
  const settings = await Settings.findOne() || await Settings.create({});
  settings.tradingOpen = tradingOpen;
  await settings.save();
  res.json(settings);
});

export default router;



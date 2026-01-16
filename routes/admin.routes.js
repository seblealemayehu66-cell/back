// routes/admin.routes.js
import express from "express";
import User from "../models/User.js";
import Settings from "../models/Settings.js";

const router = express.Router();

// GET USERS
router.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// ADD BALANCE
router.post("/add-balance", async (req, res) => {
  const { userId, amount } = req.body;
  const user = await User.findById(userId);
  user.balance += amount;
  await user.save();
  res.json({ success: true });
});

// OPEN / CLOSE TRADING
router.post("/trade-control", async (req, res) => {
  const { open } = req.body;
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  settings.tradingOpen = open;
  await settings.save();
  res.json(settings);
});

export default router;

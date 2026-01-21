import express from "express";
import User from "../models/User.js";
import AdminWallet from "../models/AdminWallet.js";
import Settings from "../models/Settings.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

/* USERS */
router.get("/users", adminAuth, async (_, res) => {
  res.json(await User.find());
});

router.post("/users/balance", adminAuth, async (req, res) => {
  const { userId, amount, type } = req.body;
  const user = await User.findById(userId);

  if (type === "add") user.balance += amount;
  else user.balance -= amount;

  await user.save();
  res.json(user);
});

/* WALLETS */
router.get("/wallets", adminAuth, async (_, res) => {
  res.json(await AdminWallet.find());
});

router.post("/wallets/add", adminAuth, async (req, res) => {
  res.json(await AdminWallet.create(req.body));
});

router.put("/wallets/:id/toggle", adminAuth, async (req, res) => {
  const w = await AdminWallet.findById(req.params.id);
  w.active = !w.active;
  await w.save();
  res.json(w);
});

/* TRADING */
router.post("/trading", adminAuth, async (req, res) => {
  let s = await Settings.findOne();
  if (!s) s = await Settings.create({});
  s.tradingOpen = req.body.open;
  await s.save();
  res.json(s);
});

router.get("/trading", async (_, res) => {
  const s = await Settings.findOne();
  res.json(s || { tradingOpen: true });
});

export default router;


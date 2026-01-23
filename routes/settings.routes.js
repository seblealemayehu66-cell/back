import express from "express";
import Settings from "../models/Settings.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const settings = await Settings.findOne();
  res.json({ tradingOpen: settings?.tradingOpen ?? true });
});

export default router;

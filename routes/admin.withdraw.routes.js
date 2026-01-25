import express from "express";
import Withdraw from "../models/Withdraw.js";
import Admin from "../models/Admin.js";
import authAdmin from "../middleware/authAdmin.js"; // auth middleware for admin

const router = express.Router();

// ✅ Get all withdrawals
router.get("/", authAdmin, async (req, res) => {
  try {
    const withdraws = await Withdraw.find()
      .populate("userId", "email")
      .sort({ createdAt: -1 });
    res.json(withdraws);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Approve / Reject withdraw
router.put("/:id", authAdmin, async (req, res) => {
  try {
    const { status, txid } = req.body;

    const withdraw = await Withdraw.findById(req.params.id);
    if (!withdraw) return res.status(404).json({ message: "Not found" });

    withdraw.status = status; // "approved" | "rejected"
    withdraw.txid = txid || withdraw.txid;

    await withdraw.save();

    res.json(withdraw);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

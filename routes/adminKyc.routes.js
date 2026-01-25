// routes/adminKyc.routes.js
import express from "express";
import Kyc from "../models/Kyc.js";
import { isAdmin } from "../middleware/admin.js";

const router = express.Router();

// ===== GET PENDING KYC =====
router.get("/pending", isAdmin, async (req, res) => {
  try {
    const kycs = await Kyc.find({ status: "pending" }).populate("userId", "username email");
    res.json(kycs);
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

// ===== APPROVE / REJECT KYC =====
router.put("/:id", isAdmin, async (req, res) => {
  try {
    const { status } = req.body; // approved / rejected
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const kyc = await Kyc.findById(req.params.id);
    if (!kyc) return res.status(404).json({ message: "KYC not found" });

    kyc.status = status;
    await kyc.save();

    res.json({ message: `KYC ${status}`, kyc });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

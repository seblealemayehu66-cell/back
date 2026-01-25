// routes/kyc.routes.js
import express from "express";
import Kyc from "../models/Kyc.js";
import authMiddleware from "../middleware/auth.js"; // JWT auth

const router = express.Router();

// Submit KYC
router.post("/submit", authMiddleware, async (req, res) => {
  try {
    const { fullName, dob, country, documentType, documentImage } = req.body;

    const kyc = new Kyc({
      userId: req.user.id,
      fullName,
      dob,
      country,
      documentType,
      documentImage,
    });

    await kyc.save();
    res.json({ message: "KYC submitted successfully", kyc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user KYC status
router.get("/status", authMiddleware, async (req, res) => {
  try {
    const kyc = await Kyc.findOne({ userId: req.user.id });
    res.json(kyc || { status: "not_submitted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

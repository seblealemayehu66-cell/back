// routes/kyc.routes.js
import express from "express";
import Kyc from "../models/Kyc.js";
import authMiddleware from "../middleware/auth.js"; // JWT auth
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// ===== Multer setup =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/kyc/";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});

// ===== Submit KYC with image upload =====
router.post("/submit", authMiddleware, upload.single("documentImage"), async (req, res) => {
  try {
    const { fullName, dob, country, documentType } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a document image" });
    }

    const existingKyc = await Kyc.findOne({ userId: req.user.id });
    if (existingKyc) {
      return res.status(400).json({ message: "KYC already submitted" });
    }

    const kyc = new Kyc({
      userId: req.user.id,
      fullName,
      dob,
      country,
      documentType,
      documentImage: req.file.path, // store the uploaded file path
    });

    await kyc.save();
    res.json({ message: "KYC submitted successfully", kyc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ===== Get user KYC status =====
router.get("/status", authMiddleware, async (req, res) => {
  try {
    const kyc = await Kyc.findOne({ userId: req.user.id });
    res.json(kyc || { status: "not_submitted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;


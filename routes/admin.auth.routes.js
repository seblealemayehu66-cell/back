import express from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const router = express.Router();

// =======================
// ADMIN LOGIN
// =======================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin)
      return res.status(401).json({ message: "Admin not found" });

    const ok = await admin.comparePassword(password);

    if (!ok)
      return res.status(401).json({ message: "Wrong password" });

    const token = jwt.sign(
      {
        id: admin._id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      admin: {
        email: admin.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;


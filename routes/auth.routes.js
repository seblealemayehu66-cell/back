// routes/auth.routes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Notification from "../models/Notification.js";
import getNextUid from "../middleware/getNextUid.js";

const router = express.Router();


// ======================
// REGISTER
// ======================
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // check existing user
    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({ error: "User already exists" });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // 🔥 AUTO INCREMENT UID
    const uid = await getNextUid();

    // create user
    const user = await User.create({
      uid,
      username,
      email,
      password: hashed
    });

    // notification
    await Notification.create({
      message: `New user registered: ${email}`
    });

    res.json({
      success: true,
      uid: user.uid
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// ======================
// LOGIN
// ======================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ error: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.json({ error: "Wrong password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

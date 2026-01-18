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

    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const uid = await getNextUid();

    const user = await User.create({
      uid,
      username,
      email,
      password: hashed,
      balance: 1000, // demo balance
    });

    await Notification.create({
      message: `New user registered: ${email}`,
    });

    res.status(201).json({
      success: true,
      uid: user.uid,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// ======================
// LOGIN
// ======================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(401).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        uid: user.uid,
        username: user.username,
        email: user.email,
        balance: user.balance,
      },
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;


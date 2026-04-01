import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const email = "admin@gmail.com";
    const password = "admin123";

    const hash = await bcrypt.hash(password, 10);

    const existing = await Admin.findOne({ email });

    if (existing) {
      existing.password = hash;
      await existing.save();
      console.log("⚠️ Admin password reset");
    } else {
      await Admin.create({
        email,
        password: hash,
      });
      console.log("✅ Admin created");
    }

    console.log("Email:", email);
    console.log("Password:", password);

    process.exit(0);

  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

run();

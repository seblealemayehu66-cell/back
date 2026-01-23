import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

async function createAdmin() {
  const email = "admin@test.com"; // you can change this
  const password = "admin123";

  const hash = await bcrypt.hash(password, 10);

  // check if admin exists
  const existing = await Admin.findOne({ email });
  if (existing) {
    existing.password = hash; // reset password if exists
    await existing.save();
    console.log("⚠️ Admin password reset");
  } else {
    await Admin.create({ email, password: hash });
    console.log("✅ Admin created");
  }

  console.log("Email:", email);
  console.log("Password:", password);

  process.exit();
}

createAdmin();


import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/Admin.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const exists = await Admin.findOne({ email: "admin@gmail.com" });

if (!exists) {
  await Admin.create({
    email: "admin@gmail.com",
    password: "admin123"
  });

  console.log("✅ Admin created");
} else {
  console.log("ℹ️ Admin already exists");
}

process.exit();

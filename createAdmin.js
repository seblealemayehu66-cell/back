import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";

mongoose.connect(process.env.MONGO_URI);

async function createAdmin() {
  const email = "admin@gmail.com";
  const password = "admin123";

  const hash = await bcrypt.hash(password, 10);

  await Admin.create({
    email,
    password: hash
  });

  console.log("✅ Admin created");
  console.log("Email:", email);
  console.log("Password:", password);

  process.exit();
}

createAdmin();


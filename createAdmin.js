import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";

const mongoUri = "mongodb+srv://admin:miracle12345678@cluster0.i7ocwve.mongodb.net/crypto_db?retryWrites=true&w=majority";

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

async function createAdmin() {
  const email = "admin@gmail.com";
  const password = "admin123";

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists");
      console.log("Email:", existingAdmin.email);
      process.exit();
    }

    const hash = await bcrypt.hash(password, 10);

    await Admin.create({ email, password: hash });

    console.log("✅ Admin created successfully");
    console.log("Email:", email);
    console.log("Password:", password);
    process.exit();
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
}

createAdmin();

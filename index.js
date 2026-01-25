// index.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import adminSetupRoutes from "./routes/admin.setup.routes.js";

import walletRoutes from "./routes/wallet.routes.js";
import adminWalletRoutes from "./routes/admin.wallet.routes.js";
import publicAdminWalletRoutes from "./routes/public.adminwallet.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import tradeRoutes from "./routes/trade.routes.js";

import withdrawRoutes from "./routes/withdraw.routes.js";
  import kycRoutes from "./routes/kyc.routes.js";



// Public routes
import adminWithdrawRoutes from "./routes/admin.withdraw.routes.js";

// only admin authenticated


import adminKycRoutes from "./routes/adminKyc.routes.js";















// ===== LOAD ROUTES =====
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import adminAuthRoutes from "./routes/admin.auth.routes.js";





// optional route to fetch by UID


// ===== LOAD ENVIRONMENT VARIABLES =====
dotenv.config();

const app = express();

// ===== MIDDLEWARE =====
app.use(cors({ origin: "*" })); // Allow requests from any origin
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// ===== ROUTES =====
app.use("/api/auth", authRoutes);    // register, login, current user
app.use("/api/admin/", adminRoutes);  // admin routes (if you have any)
app.use("/api/admin/wallets", adminRoutes);
app.use("/api", authRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/setup", adminSetupRoutes);

app.use("/api/account", walletRoutes);
app.use("/api/admin", adminWalletRoutes);
app.use("/api/public", publicAdminWalletRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/trade", tradeRoutes);

app.use("/api/withdraw", withdrawRoutes);
app.use("/api/admin/withdraws", adminWithdrawRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/admin/kyc", adminKycRoutes); // Admin KYC routes





// ===== HEALTH CHECK =====
app.get("/", (req, res) => res.send("Backend is running 🚀"));

// ===== 404 HANDLER =====
app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// ===== DATABASE CONNECTION =====
const DB = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/crypto";

mongoose
  .connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));



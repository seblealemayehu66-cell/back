// index.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import tradeRoutes from "./routes/trade.routes.js";
// Load environment variables first
dotenv.config();

const app = express();

// ===== MIDDLEWARE =====
app.use(cors({ origin: "*" })); // Allow all origins
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// ===== ROUTES =====
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/trade", tradeRoutes);
app.use("/api/wallet", walletRoutes); // optional

// ===== HEALTH CHECK =====
app.get("/", (req, res) => res.send("Backend is running 🚀"));

// ===== 404 =====
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

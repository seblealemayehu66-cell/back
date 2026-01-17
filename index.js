// index.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import tradeRoutes from "./routes/trade.routes.js";
import cors from "cors";
const app = express();

app.use(cors({
  origin: "*",
}));


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/trade", tradeRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"));

app.listen(process.env.PORT, () =>
  console.log("Server running")
);

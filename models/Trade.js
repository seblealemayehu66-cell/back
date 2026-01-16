// models/Trade.js
import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  duration: Number,
  profit: Number,
  status: { type: String, default: "open" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Trade", tradeSchema);

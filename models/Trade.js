import mongoose from "mongoose";

export default mongoose.model(
  "Trade",
  new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    coin: String,
    amount: Number,
    result: String,
    profit: Number,
    createdAt: { type: Date, default: Date.now }
  })
);


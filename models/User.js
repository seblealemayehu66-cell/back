// models/User.js
import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const userSchema = new mongoose.Schema({
   uid: {
    type: Number,
    unique: true
  },
  username: String,
  email: { type: String, unique: true },
  password: String,

  balance: {
    BTC: { type: Number, default: 0 },
    ETH: { type: Number, default: 0 },
    USDT: { type: Number, default: 0 }
  },

  withdrawPassword: String,
  kycStatus: { type: String, default: "pending" },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);

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
    USDT: { type: Number, default: 0 },
      SOL: { type: Number, default: 0 },
      BNB: { type: Number, default: 0 },
      ADA: { type: Number, default: 0 },
      XRP: { type: Number, default: 0 },
      DOT: { type: Number, default: 0 },
      DOGE: { type: Number, default: 0 },
      LTC: { type: Number, default: 0 },
      AVAX: { type: Number, default: 0 },
      SHIB: { type: Number, default: 0 },
    
  },

  withdrawPassword: String,
  kycStatus: { type: String, default: "pending" },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);

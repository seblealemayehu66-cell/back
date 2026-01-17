// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
   uid: {
    type: Number,
    unique: true
  },
  username: String,
  email: { type: String, unique: true },
  password: String,

  balance: { type: Number, default: 0 },

  withdrawPassword: String,
  kycStatus: { type: String, default: "pending" },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);

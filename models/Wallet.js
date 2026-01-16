// models/Wallet.js
import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
  coin: String,
  address: String,
  network: String,
  active: { type: Boolean, default: true }
});

export default mongoose.model("Wallet", walletSchema);

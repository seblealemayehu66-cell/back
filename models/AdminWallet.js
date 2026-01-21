import mongoose from "mongoose";

const adminWalletSchema = new mongoose.Schema({
  coin: { type: String, required: true },
  network: { type: String, required: true },
  address: { type: String, required: true, unique: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("AdminWallet", adminWalletSchema);

import mongoose from "mongoose";

export default mongoose.model(
  "AdminWallet",
  new mongoose.Schema(
    {
      coin: String,
      network: String,
      address: String,
      active: { type: Boolean, default: true }
    },
    { timestamps: true }
  )
);


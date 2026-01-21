import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    coin: {
      type: String,
      required: true,
      uppercase: true
    },

    network: {
      type: String,
      required: true,
      uppercase: true
    },

    address: {
      type: String,
      required: true
    },

    status: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Wallet", walletSchema);

import mongoose from "mongoose";

export default mongoose.model(
  "Settings",
  new mongoose.Schema({
    tradingOpen: { type: Boolean, default: true }
  })
);


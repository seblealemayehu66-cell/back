// models/Settings.js
import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  tradingOpen: { type: Boolean, default: true },
  profitPercent: { type: Number, default: 30 }
});

export default mongoose.model("Settings", settingsSchema);

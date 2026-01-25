// models/Kyc.js
import mongoose from "mongoose";

const kycSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fullName: { type: String, required: true },
  dob: { type: String, required: true },
  country: { type: String, required: true },
  documentType: { type: String, required: true }, // Passport / ID / Driver License
  documentImage: { type: String, required: true }, // filename or URL of uploaded image
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Kyc", kycSchema);


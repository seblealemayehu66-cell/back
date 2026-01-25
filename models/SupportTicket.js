// models/SupportTicket.js
import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: "open" }, // open / resolved / closed
  reply: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("SupportTicket", supportTicketSchema);


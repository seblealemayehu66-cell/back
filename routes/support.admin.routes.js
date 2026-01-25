import express from "express";
import SupportTicket from "../models/SupportTicket.js";
import verifyAdmin from "../middleware/verifyAdmin.js"; // Admin auth middleware

const router = express.Router();

// Get all tickets
router.get("/tickets", verifyAdmin, async (req, res) => {
  try {
    const tickets = await SupportTicket.find().populate("user", "username email").sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get a single ticket
router.get("/tickets/:id", verifyAdmin, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id).populate("user", "username email");
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Reply to ticket
router.post("/tickets/:id/reply", verifyAdmin, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    ticket.messages.push({
      sender: "admin",
      message,
    });

    // Optional: auto-close ticket after admin reply
    ticket.status = "Open";

    await ticket.save();
    res.json(ticket.messages.at(-1)); // Return last message
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Close ticket
router.post("/tickets/:id/close", verifyAdmin, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    ticket.status = "Closed";
    await ticket.save();
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

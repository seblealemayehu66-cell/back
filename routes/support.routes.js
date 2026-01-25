import express from "express";
import SupportTicket from "../models/SupportTicket.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Get all tickets of logged-in user
router.get("/my-tickets", verifyToken, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
});

// Create new ticket
router.post("/create", verifyToken, async (req, res) => {
  const { subject, message } = req.body;
  if (!subject || !message) return res.status(400).json({ message: "Subject and message required" });

  try {
    const ticket = new SupportTicket({
      user: req.user._id,
      subject,
      messages: [{ sender: "user", message }],
      status: "open",
    });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: "Failed to create ticket" });
  }
});

// Send a message to a ticket
router.post("/:id/message", verifyToken, async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: "Message required" });

  try {
    const ticket = await SupportTicket.findOne({ _id: req.params.id, user: req.user._id });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.messages.push({ sender: "user", message });
    await ticket.save();
    res.json({ ticket });
  } catch (err) {
    res.status(500).json({ message: "Failed to send message" });
  }
});

export default router;


// routes/support.routes.js
import express from "express";
import SupportTicket from "../models/SupportTicket.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Create new support ticket
router.post("/create", verifyToken, async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message)
      return res.status(400).json({ message: "Subject and message required" });

    const ticket = new SupportTicket({
      userId: req.user._id,
      subject,
      message,
    });

    await ticket.save();
    res.status(201).json({ message: "Support ticket created", ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create ticket" });
  }
});

// Get all tickets for logged-in user
router.get("/my-tickets", verifyToken, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
});

// Get single ticket details
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const ticket = await SupportTicket.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch ticket" });
  }
});

// Admin reply to ticket (optional)
router.post("/reply/:id", verifyToken, async (req, res) => {
  try {
    // For admin only — you can add check for admin role here
    const { reply } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.reply = reply;
    ticket.status = "resolved";
    await ticket.save();

    res.json({ message: "Reply sent", ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reply ticket" });
  }
});

export default router;

import express from "express";
import Withdraw from "../models/Withdraw.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const withdraw = await Withdraw.create({
      user: req.user.id,
      ...req.body,
    });

    res.json(withdraw);
  } catch (e) {
    res.status(500).json({ message: "Withdraw error" });
  }
});

router.get("/admin", async (req, res) => {
  const data = await Withdraw.find().populate("user");
  res.json(data);
});

router.put("/:id/approve", async (req, res) => {
  await Withdraw.findByIdAndUpdate(req.params.id, {
    status: "approved",
  });
  res.json({ success: true });
});

router.put("/:id/reject", async (req, res) => {
  await Withdraw.findByIdAndUpdate(req.params.id, {
    status: "rejected",
  });
  res.json({ success: true });
});

export default router;

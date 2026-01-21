import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const adminAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer "))
      return res.status(401).json({ message: "No token" });

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin")
      return res.status(403).json({ message: "Not admin" });

    const admin = await Admin.findById(decoded.id);

    if (!admin)
      return res.status(401).json({ message: "Admin not found" });

    req.admin = admin;

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default adminAuth;


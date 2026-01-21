import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const adminAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = header.split(" ")[1];

    // verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // find admin by ID in token
    const admin = await Admin.findById(decoded.id).select("_id email");

    if (!admin) {
      return res.status(401).json({
        message: "Admin not found",
      });
    }

    // attach admin to request
    req.admin = admin;
    req.adminId = admin._id;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export default adminAuth;

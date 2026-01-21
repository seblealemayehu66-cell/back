import jwt from "jsonwebtoken";

export default function adminAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No admin token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.admin) throw new Error();
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid admin token" });
  }
}

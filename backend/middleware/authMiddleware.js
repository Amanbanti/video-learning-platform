import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// Auth middleware
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token; // assuming JWT in httpOnly cookie
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token expired or invalid" });
  }
};

// Admin check
export const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.isAdmin) next();
  else res.status(403).json({ message: "Admin access required" });
};

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const requireAuth = async (req,res,next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Authorization required" });
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.id);
    next();
  } catch (e) { res.status(401).json({ error: "Invalid token" }); }
};

export const requireAdmin = (req,res,next) => {
  if (!req.user) return res.status(401).json({ error: "Auth required" });
  if (req.user.role !== "admin") return res.status(403).json({ error: "Admin required" });
  next();
};

export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Auth required" });
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ error: "Superadmin required" });
  }
  next();
};

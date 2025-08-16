import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, password, grade, parentEmail, teacherEmail } = req.body;
    if (!name || !email || !password || !grade) return res.status(400).json({ error: "name,email,password,grade required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, password: hashed, level: "primary", grade, parentEmail, teacherEmail
    });

    res.status(201).json({ id: user._id, name: user.name, email: user.email, level: user.level, grade: user.grade });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email & password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, level: user.level, grade: user.grade } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

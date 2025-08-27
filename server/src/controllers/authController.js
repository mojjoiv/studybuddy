// controllers/authController.js

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * Student registration
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, grade, parentEmail, teacherEmail } = req.body;
    if (!name || !email || !password || !grade) {
      return res.status(400).json({ error: "name, email, password, grade required" });
    }

    // check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // create student user
    const user = await User.create({
      name,
      email,
      password: hashed,
      level: "primary",
      grade,
      role: "student",
      parentEmail,
      teacherEmail,
    });

    // generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, level: user.level },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // response
    res.status(201).json({
      message: "Student registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        level: user.level,
        grade: user.grade,
        parentEmail: user.parentEmail,
        teacherEmail: user.teacherEmail,
      },
      token,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/**
 * Superadmin registration (one-time or restricted use)
 */
export const registerSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, password required" });
    }

    // check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // create superadmin user
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "superadmin",
      level: "system",
      grade: "N/A",
    });

    // generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, level: user.level },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Superadmin registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/**
 * Login for all users
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email & password required" });
    }

    // find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // check password
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, level: user.level },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        level: user.level,
        grade: user.grade,
        parentEmail: user.parentEmail,
        teacherEmail: user.teacherEmail,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

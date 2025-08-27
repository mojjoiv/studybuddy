import express from "express";
import { register, login, registerSuperAdmin } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/register-superadmin", registerSuperAdmin);

export default router;

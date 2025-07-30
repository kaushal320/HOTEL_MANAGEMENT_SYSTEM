import express from "express";
import {
  register,
  login,
  googleLogin,
  logout,
  getCurrentUser,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/logout", logout);
router.get("/me", protect, getCurrentUser);

// Example: only admins can access
router.get("/admin-only", protect, allowRoles("admin"), (req, res) => {
  res.json({ msg: "Hello Admin 👑" });
});

export default router;

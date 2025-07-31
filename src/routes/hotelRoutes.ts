import express from "express";
import { upload } from "../middlewares/upload.js";
import { createHotel } from "../controllers/hotelController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, upload.array("images", 5), createHotel);

export default router;

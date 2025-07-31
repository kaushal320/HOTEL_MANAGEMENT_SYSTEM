import express from "express";
import {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
} from "../controllers/hotelController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

// Create hotel
router.post(
  "/create",
  protect,
  allowRoles("admin", "receptionist"),
  upload.array("images", 10),
  createHotel
);

// Get all hotels
router.get("/all", protect, getHotels);

// Get hotel by ID
router.get("/:id", protect, getHotelById);

// Update hotel
router.put(
  "/update/:id",
  protect,
  allowRoles("admin", "receptionist"),
  upload.array("images", 10),
  updateHotel
);

// Delete hotel
router.delete("/delete/:id", protect, allowRoles("admin"), deleteHotel);

export default router;

import express from "express";
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
} from "../controllers/bookingController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/create", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.get("/all", protect, allowRoles("admin", "receptionist"), getAllBookings);
router.put("/update/:id", protect, allowRoles("admin", "receptionist"), updateBookingStatus);
router.delete("/delete/:id", protect, allowRoles("admin", "receptionist"), deleteBooking);

export default router;

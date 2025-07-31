import express from "express";
import {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} from "../controllers/roomController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router
  .route("/")
  .post(
    protect,
    allowRoles("admin", "receptionist"),
    upload.array("images", 10), // max 10 images
    createRoom
  )
  .get(protect, getRooms);

router
  .route("/:id")
  .get(protect, getRoomById)
  .put(
    protect,
    allowRoles("admin", "receptionist"),
    upload.array("images", 10),
    updateRoom
  )
  .delete(protect, allowRoles("admin"), deleteRoom);

export default router;

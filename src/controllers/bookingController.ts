import { Request, Response } from "express";
import Booking from "../models/booking.model.js";
import Room from "../models/room.models.js";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { hotel, room, checkIn, checkOut } = req.body;

    const roomData = await Room.findById(room);
    if (!roomData) {
      return res.status(404).json({ message: "Room not found" });
    }

    const duration =
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
      (1000 * 60 * 60 * 24);

    if (duration < 1) {
      return res
        .status(400)
        .json({ message: "Check-out must be after check-in" });
    }

    const totalPrice = roomData.price * duration;

    const booking = new Booking({
      hotel,
      room,
      user: req.user?.id,
      checkIn,
      checkOut,
      totalPrice,
    });

    await booking.save();
    // 🔽 Populate after saving
    const populatedBooking = await Booking.findById(booking._id)
      .populate("hotel")
      .populate("room")
      .populate("user");

    res
      .status(201)
      .json({
        message: "Booking created successfully",
        booking: populatedBooking,
      });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Failed to create booking", error });
  }
};

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find({ user: req.user?.id })
      .populate("hotel", "name address city images")
      .populate("room", "price amenities")
      .populate("user", "name email");
    res.status(200).json({ message: "My bookings fetched", bookings });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings", error });
  }
};

export const getAllBookings = async (_req: Request, res: Response) => {
  try {
    const bookings = await Booking.find()
      .populate("hotel", "name city") // Short info from Hotel
      .populate("room", "roomNumber price")
      .populate("user", "name email");

    res.status(200).json({ message: "All bookings fetched", bookings });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all bookings", error });
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    let booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = status;
    await booking.save();
    //  Populate after update
    booking = await Booking.findById(req.params.id)
      .populate("hotel", "name city")
      .populate("room", "roomNumber price")
      .populate("user", "name email");

    res.status(200).json({ message: "Booking status updated", booking });
  } catch (error) {
    res.status(500).json({ message: "Failed to update booking status", error });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await booking.deleteOne();
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete booking", error });
  }
};

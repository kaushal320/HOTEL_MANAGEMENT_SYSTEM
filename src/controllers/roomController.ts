import { Request, Response } from "express";
import Room from "../models/room.models.js";
import Hotel from "../models/hotel.models.js";
import cloudinary from "../config/cloudinary.js";

// Upload buffer to Cloudinary
const streamUpload = (fileBuffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "rooms",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url || "");
      }
    );
    stream.end(fileBuffer);
  });
};

// Create Room
export const createRoom = async (req: Request, res: Response) => {
  try {
    const { hotel, type, price, amenities, maxOccupancy, availableRooms } =
      req.body;

    const hotelExists = await Hotel.findById(hotel);
    if (!hotelExists) {
      return res.status(404).json({ message: "Hotel not found." });
    }

    const uploadedImages: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const url = await streamUpload(file.buffer);
        uploadedImages.push(url);
      }
    }

    const room = new Room({
      hotel,
      type,
      price,
      amenities: amenities ? JSON.parse(amenities) : [],
      maxOccupancy,
      availableRooms,
      images: uploadedImages,
    });

    await room.save();

    res.status(201).json({ message: "Room created successfully", room });
  } catch (error) {
    console.error(" Error creating room:", error);
    res.status(500).json({ message: "Failed to create room", error });
  }
};

// Get All Rooms
export const getRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await Room.find().populate("hotel", "name city country");
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch rooms", error });
  }
};

// Get Room by ID
export const getRoomById = async (req: Request, res: Response) => {
  try {
    const room = await Room.findById(req.params.id).populate(
      "hotel",
      "name city"
    );
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch room", error });
  }
};

// Update Room
export const updateRoom = async (req: Request, res: Response) => {
  try {
    const { type, price, amenities, maxOccupancy, availableRooms } = req.body;

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (req.files && Array.isArray(req.files)) {
      const uploadedImages: string[] = [];
      for (const file of req.files) {
        const url = await streamUpload(file.buffer);
        uploadedImages.push(url);
      }
      room.images = uploadedImages;
    }

    room.type = type ?? room.type;
    room.price = price ?? room.price;
    room.maxOccupancy = maxOccupancy ?? room.maxOccupancy;
    room.availableRooms = availableRooms ?? room.availableRooms;
    room.amenities = amenities ? JSON.parse(amenities) : room.amenities;

    await room.save();
    res.status(200).json({ message: "Room updated successfully", room });
  } catch (error) {
    res.status(500).json({ message: "Failed to update room", error });
  }
};

// Delete Room
export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    await room.deleteOne();

    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete room", error });
  }
};

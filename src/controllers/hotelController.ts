import { Request, Response } from "express";
import cloudinary from "../config/cloudinary.js";
import Hotel from "../models/hotel.models.js";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

const streamUpload = (fileBuffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "hotels",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url || "");
      }
    );
    stream.end(fileBuffer);
  });
};

// @desc    Create a new hotel
export const createHotel = async (req: Request, res: Response) => {
  try {
    const { name, description, address, city, country, roomsAvailable } =
      req.body;

    // Check for duplicate
    const existingHotel = await Hotel.findOne({
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      country: country.trim(),
    });

    if (existingHotel) {
      return res
        .status(409)
        .json({ message: "Hotel already exists at this location." });
    }

    const uploadedImages: string[] = [];

    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const url = await streamUpload(file.buffer);
        uploadedImages.push(url);
      }
    }

    const hotel = new Hotel({
      name: name.trim(),
      description,
      address: address.trim(),
      city: city.trim(),
      country: country.trim(),
      images: uploadedImages,
      roomsAvailable,
      createdBy: req.user?.id,
    });

    await hotel.save();
    res.status(201).json({ message: "Hotel created successfully", hotel });
  } catch (error) {
    console.error("🔥 Error creating hotel:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// @desc    Get all hotels
export const getHotels = async (_req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json({ message: "Hotels fetched successfully", hotels });
  } catch (error) {
    console.error("🔥 Error fetching hotels:", error);
    res.status(500).json({ message: "Failed to fetch hotels", error });
  }
};

// @desc    Get hotel by ID
export const getHotelById = async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    res.status(200).json({ message: "Hotel found", hotel });
  } catch (error) {
    console.error("🔥 Error fetching hotel:", error);
    res.status(500).json({ message: "Failed to fetch hotel", error });
  }
};

// @desc    Update hotel
export const updateHotel = async (req: Request, res: Response) => {
  try {
    const { name, description, address, city, country, roomsAvailable } =
      req.body;

    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    // Optional: handle image replacement if needed
    const uploadedImages: string[] = hotel.images;
    if (req.files && Array.isArray(req.files)) {
      uploadedImages.length = 0; // clear current
      for (const file of req.files) {
        const url = await streamUpload(file.buffer);
        uploadedImages.push(url);
      }
    }

    hotel.name = name?.trim() || hotel.name;
    hotel.description = description || hotel.description;
    hotel.address = address?.trim() || hotel.address;
    hotel.city = city?.trim() || hotel.city;
    hotel.country = country?.trim() || hotel.country;
    hotel.roomsAvailable = roomsAvailable ?? hotel.roomsAvailable;
    hotel.images = uploadedImages;

    await hotel.save();
    res.status(200).json({ message: "Hotel updated successfully", hotel });
  } catch (error) {
    console.error("🔥 Error updating hotel:", error);
    res.status(500).json({ message: "Failed to update hotel", error });
  }
};

// @desc    Delete hotel
export const deleteHotel = async (req: Request, res: Response) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    await hotel.deleteOne();
    res.status(200).json({ message: "Hotel deleted successfully" });
  } catch (error) {
    console.error("🔥 Error deleting hotel:", error);
    res.status(500).json({ message: "Failed to delete hotel", error });
  }
};

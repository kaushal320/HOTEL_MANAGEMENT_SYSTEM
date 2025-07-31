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

export const createHotel = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      address,
      city,
      country,
      amenities,
      roomsAvailable,
    } = req.body;

    // Check for duplicate hotel
    const existingHotel = await Hotel.findOne({
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      country: country.trim(),
    });

    if (existingHotel) {
      return res.status(409).json({
        message: "Hotel with the same name and address already exists",
      });
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
      amenities: amenities ? JSON.parse(amenities) : [],
      images: uploadedImages,
      roomsAvailable,
      createdBy: req.user?.id,
    });

    await hotel.save();
    res.status(201).json(hotel);
  } catch (error) {
    console.error("🔥 Error creating hotel:", error);
    res.status(500).json({
      message: "Failed to create hotel",
      error: error instanceof Error ? error.message : error,
    });
  }
};

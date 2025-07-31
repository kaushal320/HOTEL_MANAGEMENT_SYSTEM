// controllers/uploadController.ts
import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import fs from "fs";

export const uploadImage = async (req: Request, res: Response) => {
  try {
    const filePath = req.file?.path;
    if (!filePath) return res.status(400).json({ message: "No file uploaded" });

    const result = await cloudinary.uploader.upload(filePath, {
      folder: "hotels",
    });

    // Remove the file from local storage after upload
    fs.unlinkSync(filePath);

    res.status(200).json({ imageUrl: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error });
  }
};

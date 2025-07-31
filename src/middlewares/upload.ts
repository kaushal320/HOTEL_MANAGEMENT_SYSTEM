import multer from "multer";

// Store files temporarily in memory before uploading to Cloudinary
const storage = multer.memoryStorage();

// File type filter (allow images only)
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

// File size limit (e.g. 5MB)
const limits = {
  fileSize: 5 * 1024 * 1024,
};

export const upload = multer({
  storage,
  fileFilter,
  limits,
});

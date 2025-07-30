import jwt from "jsonwebtoken";
import { Response } from "express";

export const generateTokenAndSetCookie = (userId: string, res: Response) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict", // CSRF protection
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  return token;
};

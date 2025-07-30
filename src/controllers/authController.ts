import { Request, Response } from "express";
import User from "../models/user.models.js";
import { verifyGoogleToken } from "../utils/googleVerify.js";
import crypto from "crypto";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";

// REGISTER
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists." });
    }

    const user = await User.create({ name, email, password, role }); // include role
    generateTokenAndSetCookie(String(user._id), res);

    res.status(201).json({
      message: "Registered successfully",
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Provide email and password" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    generateTokenAndSetCookie(String(user._id), res);
    res.status(200).json({
      message: "Login successful",
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// GOOGLE LOGIN
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { token: googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({ message: "Google token is required" });
    }

    const payload = await verifyGoogleToken(googleToken);
    if (!payload?.email || !payload?.name) {
      return res.status(400).json({ message: "Google login failed." });
    }

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        password: crypto.randomBytes(16).toString("hex"),
      });
    }

    generateTokenAndSetCookie(String(user._id), res);
    res.status(200).json({
      message: "Google login successful",
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({ message: "Google login error" });
  }
};

// LOGOUT
export const logout = (req: Request, res: Response) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// GET CURRENT USER
export const getCurrentUser = (req: Request, res: Response) => {
  // @ts-ignore
  if (!req.user) return res.status(401).json({ message: "Not authorized" });

  // @ts-ignore
  const { _id, name, email, role } = req.user;
  res.json({ user: { id: _id, name, email, role } });
};

import mongoose from "mongoose";
import * as authService from "../service/auth.service.js";
import authModel from "../model/auth.model.js";

export const register = async (req, res) => {
  try {
    const payload = { ...req.body };

    // Generate tenantId when not provided so tenantId is optional for callers
    const tenantId = payload.tenantId || new mongoose.Types.ObjectId();

    payload.tenantId = tenantId;

    const existingUser = await authModel.findOne({email: payload.email });

    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists for this tenant" });
    }

    const result = await authService.registerUser(payload);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const payload = { ...req.body };

    const user = await authModel.findOne({
      email: payload.email,
    }).select("+password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordMatched = await user.comparePassword(payload.password);

    if (!isPasswordMatched) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const result = await authService.loginUser(user);

    res.status(200).json({ success: true, message: "Login successful", data: result });
  } catch (error) {
    console.error(error);
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  register,
  login,
};
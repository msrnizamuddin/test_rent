import * as authService from "../service/auth.service.js";

export const register = async (req, res) => {
  try {
    const result = await authService.registerUser(
      req.body
    );

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
    const result = await authService.loginUser(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
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
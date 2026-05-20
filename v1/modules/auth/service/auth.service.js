import mongoose from "mongoose";
import authModel from "../model/auth.model.js";

import generateToken from "../../../utils/jwt.js";

export const registerUser = async (payload) => {
  const tenantId = payload.tenantId || new mongoose.Types.ObjectId();

  const existingUser = await authModel.findOne({
    tenantId,
    email: payload.email,
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }


// create user
  const createData = { ...payload, tenantId };

  const user = await authModel.create(createData);

  // generate token
  const token = generateToken({
    id: user._id,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user,
  };
};

export const loginUser = async (payload) => {
  const user = await authModel.findOne({
    email: payload.email,
  }).select("+password");

  if (!user) {
    throw new Error("Invalid credentials");
  }





  const isPasswordMatched =
    await user.comparePassword(payload.password);

  if (!isPasswordMatched) {
    throw new Error("Invalid credentials");
  }


  const token = generateToken({
    id: user._id,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
  });


  user.password = undefined;

  return {
    token,
    user,
  };
};

export default {
  registerUser,
  loginUser,
};
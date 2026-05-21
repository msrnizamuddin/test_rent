import mongoose from "mongoose";
import authModel from "../model/auth.model.js";

import generateToken from "../../../utils/jwt.js";

export const registerUser = async (payload) => {
 


  const createData = { ...payload };

  const user = await authModel.create(createData);

  // generate token
  const token = generateToken({
    id: user._id,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
  });

  return {

  };
};

export const loginUser = async (user) => {
  // Expect a validated/verified `user` object to be passed in by the controller.

  const token = generateToken({
    id: user._id,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
  });

  user.password = undefined;

  return {
    token,
    user: {
      id: user._id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    },
  };
};

export default {
  registerUser,
  loginUser,
};
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
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
  // decode token to get expiration (exp is in seconds)
  const decoded = jwt.decode(token);
  const tokenExpiration = decoded && decoded.exp ? new Date(decoded.exp * 1000) : null;

  // persist token and expiration on the user record
  user.clientLoginToken = token;
  if (tokenExpiration) user.tokenExpiration = tokenExpiration;
  await user.save();

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
  // decode token to get expiration
  const decoded = jwt.decode(token);
  const tokenExpiration = decoded && decoded.exp ? new Date(decoded.exp * 1000) : null;

  // persist token and expiration on the user record
  user.clientLoginToken = token;
  if (tokenExpiration) user.tokenExpiration = tokenExpiration;
  await user.save();


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
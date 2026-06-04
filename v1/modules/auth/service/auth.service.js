import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Auth from "../model/auth.model.js";
import Tenant from "../../tenent/model/tenent.model.js";

export const registerService = async (payload) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const tenant = await Tenant.create(
      [
        {
          fullName: payload.fullName,
          businessName: payload.businessName,
          businessEmail: payload.businessEmail,
          createdBy: null,
          updatedBy: null,
        },
      ],
      { session },
    );

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const auth = await Auth.create(
      [
        {
          tenantId: tenant[0]._id,
          userType: payload.userType,
          emailOrPhone: payload.emailOrPhone,
          password: hashedPassword,
          supportedLanguages: payload.supportedLanguages || [],
          supportedCurrency: payload.supportedCurrency || [],
        },
      ],
      { session },
    );

    await session.commitTransaction();

    return {
      tenant: tenant[0],
      auth: auth[0],
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const loginService = async ({ emailOrPhone, password }) => {
  // only required fields select
  const user = await Auth.findOne({
    emailOrPhone,
    centralStatus: "active",
  }).select(
    "_id tenantId userType emailOrPhone password supportedLanguages supportedCurrency",
  );

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    {
      id: user._id,
      tenantId: user.tenantId,
      userType: user.userType,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  // convert to plain object
  const userObj = user.toObject();

  // remove password before sending response
  delete userObj.password;
  delete userObj._id;

  return {
    token,
    user: userObj,
  };
};

export const getAllUsersService = async () => {
  const users = await Auth.find().select("-password -__v ");

  return users;
};

export const updateUserService = async (id, payload) => {
  const allowedFields = [
    "password",
    "centralStatus",
    "supportedLanguages",
    "supportedCurrency",
    "emailOrPhone",
    "userType",
  ];

  const update = {};
  Object.keys(payload || {}).forEach((key) => {
    if (allowedFields.includes(key)) update[key] = payload[key];
  });

  if (Object.keys(update).length === 0) {
    throw new Error("No valid fields provided for update");
  }

  const user = await Auth.findByIdAndUpdate(id, update, { new: true }).select(
    "-password -__v",
  );

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Auth from "../model/auth.model.js";
import Tenant from "../../tenant/model/tenent.model.js";

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
  "+password tenantId userType emailOrPhone supportedLanguages supportedCurrency"
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

export const getAllUsersService = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    Auth.find()
      .select("-password -__v")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),

    Auth.countDocuments(),
  ]);

  return {
    users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
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
    if (allowedFields.includes(key)) {
      update[key] = payload[key];
    }
  });

  if (Object.keys(update).length === 0) {
    throw new Error("No valid fields provided for update");
  }

  if (update.password) {
    update.password = await bcrypt.hash(update.password, 10);
  }

  const user = await Auth.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

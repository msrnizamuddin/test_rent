// service/userTracking.service.js

import UserTracking from "../model/userTracking.model.js";
import { logModule } from '../../../utils/moduleLogger.js';
logModule(import.meta.url);
export const createUserTrackingService = async (payload) => {
  const tracking = await UserTracking.create(payload);

  return tracking;
};

export const getAllUserTrackingsService = async ({
  page = 1,
  limit = 10,
  eventType,
  userId,
}) => {
  const skip = (page - 1) * limit;

  const filter = {};

  if (eventType) {
    filter.eventType = eventType;
  }

  if (userId) {
    filter.userId = userId;
  }

  const [trackings, total] = await Promise.all([
    UserTracking.find(filter)
      .populate("userId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    UserTracking.countDocuments(filter),
  ]);

  return {
    trackings,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getUserTrackingByIdService = async (id) => {
  const tracking = await UserTracking.findById(id).populate(
    "userId"
  );

  if (!tracking) {
    throw new Error("Tracking record not found");
  }

  return tracking;
};

export const updateUserTrackingService = async (
  id,
  payload
) => {
  const tracking = await UserTracking.findByIdAndUpdate(
    id,
    payload,
    {
      new: true,
      runValidators: true,
    }
  ).populate("userId");

  if (!tracking) {
    throw new Error("Tracking record not found");
  }

  return tracking;
};

export const deleteUserTrackingService = async (id) => {
  const tracking = await UserTracking.findByIdAndDelete(id);

  if (!tracking) {
    throw new Error("Tracking record not found");
  }

  return tracking;
};
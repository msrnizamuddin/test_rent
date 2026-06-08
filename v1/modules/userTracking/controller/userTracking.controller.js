// controller/userTracking.controller.js

import {
  createUserTrackingService,
  getAllUserTrackingsService,
  getUserTrackingByIdService,
  updateUserTrackingService,
  deleteUserTrackingService,
} from "../service/userTracking.service.js";

export const createUserTrackingController = async (
  req,
  res
) => {
  try {
    const tracking = await createUserTrackingService(
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Tracking record created successfully",
      data: tracking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllUserTrackingsController = async (
  req,
  res
) => {
  try {
    const {
      page = 1,
      limit = 10,
      eventType,
      userId,
    } = req.query;

    const result = await getAllUserTrackingsService({
      page: Number(page),
      limit: Number(limit),
      eventType,
      userId,
    });

    res.status(200).json({
      success: true,
      message: "Tracking records retrieved successfully",
      data: result.trackings,
      meta: result.meta,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserTrackingByIdController = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const tracking =
      await getUserTrackingByIdService(id);

    res.status(200).json({
      success: true,
      message: "Tracking record retrieved successfully",
      data: tracking,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUserTrackingController = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const tracking =
      await updateUserTrackingService(
        id,
        req.body
      );

    res.status(200).json({
      success: true,
      message: "Tracking record updated successfully",
      data: tracking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteUserTrackingController = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    await deleteUserTrackingService(id);

    res.status(200).json({
      success: true,
      message: "Tracking record deleted successfully",
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};
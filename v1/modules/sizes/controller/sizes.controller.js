import {
  createSizesService,
  getAllSizesService,
  getSizesByIDService,
  updateSizesService,
} from "../service/sizes.service.js";

export const createSizesController = async (req, res, next) => {
  try {
    const sizes = await createSizesService(req.body);

    res.status(201).json({
      success: true,
      message: "Sizes created successfully",
      data: sizes,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSizesController = async (req, res, next) => {
  try {
    const result = await getAllSizesService(req.query);

    res.status(200).json({
      success: true,
      message: "Sizes fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const getSizesByIDController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sizes = await getSizesByIDService(id);

    if (!sizes) {
      return res.status(404).json({
        success: false,
        message: "Sizes not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Specific Sizes fetched successfully",
      data: sizes,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSizesController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sizes = await updateSizesService(id, req.body);

    res.status(200).json({
      success: true,
      message: "Sizes updated successfully",
      data: sizes,
    });
  } catch (error) {
    next(error);
  }
};
import {
  createDesignationService,
  getDesignationByIdService,
  getDesignationService,
  updateDesignationService,
} from "../service/designation.service.js";

export const createDesignation = async (req, res, next) => {
  try {
    const result = await createDesignationService(req.body);

    res.status(201).json({
      success: true,
      message: "Designation created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllDesignation = async (req, res, next) => {
  try {
    const result = await getDesignationService(req.query);
    res.status(200).json({
      success: true,
      message: "Designation data fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};
export const getDesignationById = async (req, res, next) => {
  const id = req.params.id;
  try {
    const result = await getDesignationByIdService(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Designation not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Specific Designation fetched successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDesignation = async (req, res, next) => {
  const id = req.params.id;
  const data = req.body;

  try {
    const result = await updateDesignationService(id, data);
    res.status(200).json({
      success: true,
      message: "Specific Designation Data Updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

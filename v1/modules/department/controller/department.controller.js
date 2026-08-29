import {
  createDepartmentService,
  getAllDepartmentService,
  getDepartmentByIdService,
  updateDepartmentService,
} from "../service/department.service.js";

export const createDepartment = async (req, res, next) => {
  try {
    const result = await createDepartmentService(req.body);

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// controller
export const getAllDepartment = async (req, res, next) => {
  try {
    const result = await getAllDepartmentService(req.query);
    res.status(200).json({
      success: true,
      message: "Department fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentById = async (req, res, next) => {
  const id = req.params.id;
  try {
    const result = await getDepartmentByIdService(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Specific Department fetched successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  const id = req.params.id;
  const data = req.body;

  try {
    const result = await updateDepartmentService(id, data);
    res.status(200).json({
      success: true,
      message: "Specific Department Data Updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

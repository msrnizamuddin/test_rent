import {
  createPermissionService,
  getAllPermissionService,
  getPermissionByIdService,
  updatePermissionService
} from "../service/permission.service.js";

export const createPermission = async (req, res, next) => {
  try {
    const result = await createPermissionService(req.body);

    res.status(201).json({
      success: true,
      message: "Permission created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// controller
export const getAllPermission = async (req, res, next) => {
  try {
    const result = await getAllPermissionService(req.query);
    res.status(200).json({
      success: true,
      message: "Permission data fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const getPermissionById = async (req, res, next) => {
  const id = req.params.id;
  try {
    const result = await getPermissionByIdService(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Permission not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Specific permission fetched successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePermission = async (req, res, next) => {
  const id = req.params.id;
  const data = req.body;

  try {
    const result = await updatePermissionService(id, data);
    res.status(200).json({
      success: true,
      message: "Specific Permission Data Updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

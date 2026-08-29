import {
  createRoleService,
  getAllRoleService,
  getRoleByIdService,
  updateRoleService,
} from "../service/role.service.js";

export const createRole = async (req, res, next) => {
  try {
    const result = await createRoleService(req.body);

    res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllRole = async (req, res, next) => {
  try {
    const result = await getAllRoleService(req.query);
    res.status(200).json({
      success: true,
      message: "Role data fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoleById = async (req, res, next) => {
  const id = req.params.id;
  try {
    const result = await getRoleByIdService(id);
    res.status(200).json({
      success: true,
      message: "Specific Role fetched successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req, res, next) => {
  const id = req.params.id;
  const data = req.body;

  try {
    const result = await updateRoleService(id, data);
    res.status(200).json({
      success: true,
      message: "Specific Role Data Updated successfully",
      data: result,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

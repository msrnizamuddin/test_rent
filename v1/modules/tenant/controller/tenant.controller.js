import {
  getAllTenantService,
  updateTenantService,
} from "../service/tenant.service.js";


export const getAllTenant = async (req, res, next) => {
  try {
    const result = await getAllTenantService(req.query);

    if (!result.data || result.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tenant fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTenant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?._id;

    const result = await updateTenantService(id, updates, userId);
    return res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
};

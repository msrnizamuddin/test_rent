import Tenant from "../model/tenent.model.js";
import {
  getAllTenantService,
  updateTenantService,
} from "../service/tenant.service.js";
export const getAllTenant = async (req, res) => {
  try {
    const tenant = await getAllTenantService();

    if (!tenant || tenant.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: tenant,
    });
  } catch (error) {
    console.error("❌ Error fetching tenant:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching tenant",
    });
  }
};

export const updateTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const updates = req.body;

    const result = await updateTenantService(tenantId, updates);
    return res.status(result.status).json(result);
  } catch (error) {
    console.error("❌ Error updating tenant:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while updating tenant",
    });
  }
};

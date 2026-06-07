import Tenant from "../model/tenent.model.js";
export const getAllTenant = async (req, res) => {
  try {
    const tenant = await Tenant.find();
    if (!tenant) {
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
    //  Validation pass — now DB update
    const tenant = await Tenant.findOneAndUpdate(
      { tenantId },
      updates, // sanitised value from updateTenantSchema
      { new: true },
    );
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Tenant updated successfully",
      data: tenant,
    });
  } catch (error) {
    console.error("Error updating tenant:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while updating tenant",
    });
  }
};

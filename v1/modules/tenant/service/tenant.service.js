import Tenant from "../model/tenant.model.js";

export const getAllTenantService = async () => {
  const tenant = await Tenant.find();
  return tenant;
};

export const updateTenantService = async (tenantId, updates) => {
  const tenant = await Tenant.findOneAndUpdate({ tenantId }, updates, {
    new: true,
    runValidators: true,
  });
  if (!tenant) {
    return { status: 404, success: false, message: "Tenant not found" };
  }

  return {
    status: 200,
    success: true,
    message: "Tenant updated successfully",
    data: tenant,
  };
};

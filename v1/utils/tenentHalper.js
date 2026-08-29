import Tenant from "../modules/tenant/model/tenant.model.js";

const tenantGetId = async (id) => {
  const tenantObj = await Tenant.findOne({ tenantId: id });

  return tenantObj;
};

export default tenantGetId;

import { uid } from "uid";
import tenentModel from "../model/tenent.model.js";

const createTenant = async (req, res) => {
  try {
    const { shopName, email, plan } = req.body;

    // Generate a unique tenantId
    const tenantId = `TEN-${uid(8)}`; // → "TEN-a1b2c3d4"

    const tenant = await tenentModel.create({
      tenantId,
      shopName,
      email,
      plan: plan || "free",
    });

    return res.status(201).json({
      success: true,
      message: "Tenant created successfully",
      data: {
        tenantId: tenant.tenantId, // → "TEN-a1b2c3d4"
        shopName: tenant.shopName,
        email: tenant.email,
        status: tenant.status,
        plan: tenant.plan,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export default createTenant;

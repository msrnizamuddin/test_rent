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

export const getAllTenant = async (req, res) => {
  try {
    const tenant = await tenentModel.find();

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

    const tenant = await tenentModel.findOneAndUpdate({ tenantId }, updates, {
      new: true,
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "✅ Tenant updated successfully",
      data: tenant,
    });
  } catch (error) {
    console.error("❌ Error updating tenant:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while updating tenant",
    });
  }
};

export default createTenant;

import tenentModel from "../model/tenent.model.js";
import { updateTenantSchema } from "../validation/tenentValidation.js";

export const createTenant = async (req, res) => {
  try {
    const value = req.body;

    const existing = await tenentModel.findOne({
      businessEmail: value.businessEmail,
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This business email is already registered",
      });
    }

    const tenant = await tenentModel.create(value);

    return res.status(201).json({
      success: true,
      message: "Tenant created successfully",
      data: tenant,
    });
  } catch (error) {
    console.error("Error creating tenant:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while creating tenant",
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

    //  Validation check first
    const { error, value } = updateTenantSchema.validate(updates, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.reduce((acc, err) => {
          acc[err.context.key] = err.message.replace(/"/g, "");
          return acc;
        }, {}),
      });
    }

    //  Validation pass — now DB update
    const tenant = await tenentModel.findOneAndUpdate(
      { tenantId },
      value, // sanitised value from updateTenantSchema
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

export default createTenant;

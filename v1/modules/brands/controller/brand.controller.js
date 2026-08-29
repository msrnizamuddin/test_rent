import tenantGetId from "../../../utils/tenentHalper.js";
import { brandsService } from "../service/brands.service.js";

export const createBrands = async (req, res, next) => {
  try {
    const tenant = await tenantGetId(req.body.tenantId);
    if (!tenant) {
      return res.status(404).json({
        status: false,
        message: "Tenant not found",
        data: null,
      });
    }

    const data = await brandsService.createBrands(req.body, tenant);

    res.status(201).json({
      success: true,
      message: "Brands created successfully",
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

export const getBrands = async (req, res, next) => {
  try {
    const result = await brandsService.getBrands(req.query);
    res.status(200).json({
      success: true,
      message: "Brands fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const getBrandsById = async (req, res, next) => {
  try {
    const data = await brandsService.getBrandsById(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Brands not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Brands fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBrands = async (req, res, next) => {
  try {
    const data = await brandsService.updateBrands(req.params.id, req.body);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Currency not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Currency updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

import { Brand } from "../model/brand.model.js";

const createBrand = async (req, res,next) => {
  try {
    const { tenantId, ...rest } = req.body;



    const data = await Brand.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Brand  created successfully",
      data: data
    });
  } catch (error) {
    next(error)
  }
};

export default createBrand
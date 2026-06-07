import { Brand } from "../model/brand.model.js";


const createBrand = async (req, res, next) => {
  try {

    const data = await Brand.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: data
    });
  } catch (error) {
    next(error);
  }
};


const getBrands = async (req, res, next) => {
  try {
    const filter = req.query.tenantId ? { tenantId: req.query.tenantId } : {};
    const data = await Brand.find(filter);

    return res.status(200).json({
      success: true,
      message: 'Brands fetched successfully',
      data: data
    });
  } catch (error) {
    next(error);
  }
};


const getBrandById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const data = await Brand.findById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Brand fetched successfully',
      data: data
    });
  } catch (error) {
    next(error);
  }
};


const updateBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.body?.tenantId || req.query?.tenantId;

    const query = { _id: id };
    if (tenantId) {
      query.tenantId = tenantId;
    }

    console.log('Update Payload:', req.body);

    const updatedBrand = await Brand.findByIdAndUpdate(
      query,
      { $set: req.body },
      {
        runValidators: true
      }
    );

    if (!updatedBrand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found or you do not have permission to update it'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Brand updated successfully',
      data: updatedBrand
    });
  } catch (error) {
    // Pass the error to your global error handler instead of just logging it
    next(error);
  }
};

// 5. DELETE Brand
const deleteBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tenantId = req.query?.tenantId;

    const query = { _id: id };
    if (tenantId) {
      query.tenantId = tenantId;
    }

    const deletedBrand = await Brand.findOneAndDelete(query);

    if (!deletedBrand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Brand deleted successfully',
      data: deletedBrand
    });
  } catch (error) {
    next(error);
  }
};

const brandController = {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand
};

export default brandController;
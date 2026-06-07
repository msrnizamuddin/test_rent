import {
  createCustomerService,
  getAllCustomersService,
  getCustomerByIdService,
  updateCustomerService,
} from "../service/customer.service.js";

export const createCustomerController = async (req, res) => {
  try {
    const customer = await createCustomerService(
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllCustomersController = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result =
      await getAllCustomersService({
        page,
        limit,
      });

    res.status(200).json({
      success: true,
      message: "Customers retrieved successfully",
      data: result.customers,
      meta: result.meta,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCustomerByIdController = async (req, res) => {
  try {
    const customer =
      await getCustomerByIdService(
        req.params.id
      );

    res.status(200).json({
      success: true,
      message: "Customer retrieved successfully",
      data: customer,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCustomerController = async (req, res) => {
  try {
    const customer =
      await updateCustomerService(
        req.params.id,
        req.body
      );

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
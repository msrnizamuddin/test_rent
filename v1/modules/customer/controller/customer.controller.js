import {
  createCustomerService,
  loginCustomerService,
  getAllCustomersService,
  getCustomerByIdService,
  updateCustomerService,
  addCustomerAddressService,
  updateCustomerAddressService,
  deleteCustomerAddressService,
} from "../service/customer.service.js";
import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);
export const createCustomerController = async (req, res, next) => {
  try {
    const customer = await createCustomerService(req.body);
    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};
export const loginCustomerController = async (req, res, next) => {
  try {
    const result = await loginCustomerService(req.body);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const getAllCustomersController = async (req, res, next) => {
  try {
    const result = await getAllCustomersService(req.query);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const getCustomerByIdController = async (req, res, next) => {
  try {
    const customer = await getCustomerByIdService(req.params.id);
    return res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};
export const updateCustomerController = async (req, res, next) => {
  try {
    const customer = await updateCustomerService(req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};
export const addCustomerAddressController = async (req, res, next) => {
  try {
    const address = await addCustomerAddressService(req.params.id, req.body);
    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};
export const updateCustomerAddressController = async (req, res, next) => {
  try {
    const address = await updateCustomerAddressService(
      req.params.id,
      req.params.addressId,
      req.body,
    );
    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteCustomerAddressController = async (req, res, next) => {
  try {
    const addresses = await deleteCustomerAddressService(
      req.params.id,
      req.params.addressId,
    );
    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

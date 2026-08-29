import Joi from "joi";
import mongoose from "mongoose";
const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message({
      custom: `"${helpers.state.path.join(".")}" must be a valid ObjectId`,
    });
  }

  return value;
};
export const updateTenantOrderStatusValidation = Joi.object({
  tenantStatus: Joi.string()
    .valid(
      "pending",
      "accepted",
      "processing",
      "ready",
      "picked_up",
      "completed",
      "cancelled",
    )
    .required(),

  remarks: Joi.string().trim().allow("").optional(),
});
const addressSchema = Joi.object({
  district: Joi.string().trim().required(),
  thana: Joi.string().trim().required(),
  addressLine: Joi.string().trim().required(),
});

const guestInfoSchema = Joi.object({
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  email: Joi.string().email().trim().allow("").optional(),
  phone: Joi.string().trim().required(),
});

const pricingSchema = Joi.object({
  subTotal: Joi.number().min(0).required(),
  couponCode: Joi.string().trim().allow("").optional(),
  discountAmount: Joi.number().min(0).default(0),
  deliveryCharge: Joi.number().min(0).default(0),
  deliveryState: Joi.string().trim().allow("").optional(),
  taxAmount: Joi.number().min(0).default(0),
  grandTotal: Joi.number().min(0).required(),
});
const orderItemSchema = Joi.object({
  productId: Joi.string().custom(objectId).required(),
  inventoryId: Joi.string().custom(objectId).required(),

  quantity: Joi.number().integer().min(1).required(),

  unitPrice: Joi.number().min(0).required(),

  totalPrice: Joi.number().min(0).required(),
});
export const createOrderValidation = Joi.object({
  orderType: Joi.string().valid("GUEST", "REGISTERED").required(),

  customerId: Joi.when("orderType", {
    is: "REGISTERED",
    then: Joi.string().custom(objectId).required(),
    otherwise: Joi.valid(null).optional(),
  }),

  guestInfo: Joi.when("orderType", {
    is: "GUEST",
    then: guestInfoSchema.required(),
    otherwise: Joi.valid(null).optional(),
  }),

  orderDate: Joi.date().required(),

  firstName: Joi.string().trim().required(),

  lastName: Joi.string().trim().required(),

  phone: Joi.string().trim().required(),

  items: Joi.array().items(orderItemSchema).min(1).required(),

  shippingAddress: addressSchema.required(),

  billingAddress: addressSchema.optional(),

  pricing: pricingSchema.required(),

  paymentMethod: Joi.string().valid("cod", "gateway").required(),

  notes: Joi.string().trim().allow("").optional(),
});
export const updateOrderStatusValidation = Joi.object({
  orderStatus: Joi.string()
    .valid(
      "pending",
      "confirmed",
      "processing",
      "packed",
      "shipped",
      "delivered",
      "cancelled",
      "returned",
    )
    .required(),

  paymentStatus: Joi.string()
    .valid("pending", "paid", "failed", "refunded")
    .required(),

  remarks: Joi.string().trim().allow("").optional(),
});
export const updateOrderValidation = Joi.object({
  shippingAddress: addressSchema.optional(),
  billingAddress: addressSchema.optional(),
  pricing: pricingSchema.optional(),
  paymentMethod: Joi.string().valid("cod", "gateway").optional(),
  notes: Joi.string().trim().allow("").optional(),
}).min(1);

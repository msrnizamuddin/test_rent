import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Customer from "../model/customer.model.js";
import { logModule } from "../../../utils/moduleLogger.js";
logModule(import.meta.url);
export const createCustomerService = async (payload) => {
  const email = payload.email?.trim().toLowerCase();
  const phone = payload.phone?.trim();
  const conditions = [];
  if (email) {
    conditions.push({ email });
  }
  if (phone) {
    conditions.push({ phone });
  }
  if (!conditions.length) {
    throw new Error("Either email or phone number is required.");
  }
  const existingCustomer = await Customer.findOne({
    $or: conditions,
  });
  if (existingCustomer) {
    if (email && existingCustomer.email === email) {
      throw new Error("A customer with this email already exists.");
    }
    if (phone && existingCustomer.phone === phone) {
      throw new Error("A customer with this phone number already exists.");
    }
    throw new Error("Customer already exists.");
  }
  const passwordHash = await bcrypt.hash(payload.password, 10);
  const customer = await Customer.create({
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    email: email || undefined,
    phone: phone || undefined,
    passwordHash,
    profilePicture: payload.profilePicture ?? null,
    billingAddress: payload.billingAddress,
    shippingAddress: payload.shippingAddress,
    addresses: payload.shippingAddress
      ? [
          {
            district: payload.shippingAddress.district,
            thana: payload.shippingAddress.thana,
            addressLine: payload.shippingAddress.addressLine,
            isDefault: true,
          },
        ]
      : [],
    isGuest: false,
    isVerified: false,
  });
  const result = customer.toObject();
  delete result.passwordHash;
  delete result.__v;
  return result;
};
export const loginCustomerService = async ({ email, phone, password }) => {
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedPhone = phone?.trim();
  let customer;
  if (normalizedEmail) {
    customer = await Customer.findOne({
      email: normalizedEmail,
      status: "active",
    });
  }
  if (!customer && normalizedPhone) {
    customer = await Customer.findOne({
      phone: normalizedPhone,
      status: "active",
    });
  }
  if (!customer) {
    throw new Error("No such customer account exists.");
  }
  if (!customer.passwordHash) {
    throw new Error("This customer account cannot be used for password login.");
  }
  const isPasswordValid = await bcrypt.compare(password, customer.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Invalid email/phone or password.");
  }
  const token = jwt.sign(
    {
      id: customer._id,
      email: customer.email || null,
      phone: customer.phone || null,
      fullName: customer.fullName,
      status: customer.status,
      isVerified: customer.isVerified,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
  return {
    token,
    customer: {
      id: customer._id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      fullName: customer.fullName,
      email: customer.email || null,
      phone: customer.phone || null,
      status: customer.status,
      isVerified: customer.isVerified,
    },
  };
};
export const getAllCustomersService = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [customers, total] = await Promise.all([
    Customer.find({
      status: "active",
    })
      .select("-passwordHash -__v")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Customer.countDocuments({
      status: "active",
    }),
  ]);
  return {
    customers,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
export const getCustomerByIdService = async (id) => {
  const customer = await Customer.findOne({
    _id: id,
    status: "active",
  }).select("-passwordHash -__v");
  if (!customer) {
    throw new Error("Customer not found.");
  }
  return customer;
};
export const updateCustomerService = async (id, payload) => {
  const existingCustomer = await Customer.findOne({
    _id: id,
    status: "active",
  });
  if (!existingCustomer) {
    throw new Error("Customer not found.");
  }
  const updateData = { ...payload };
  if (updateData.password) {
    updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
    delete updateData.password;
  }
  if (updateData.email !== undefined) {
    updateData.email = updateData.email
      ? updateData.email.trim().toLowerCase()
      : undefined;
  }
  if (updateData.phone !== undefined) {
    updateData.phone = updateData.phone ? updateData.phone.trim() : undefined;
  }
  const duplicateConditions = [];
  if (updateData.email && updateData.email !== existingCustomer.email) {
    duplicateConditions.push({
      email: updateData.email,
    });
  }
  if (updateData.phone && updateData.phone !== existingCustomer.phone) {
    duplicateConditions.push({
      phone: updateData.phone,
    });
  }
  if (duplicateConditions.length) {
    const duplicateCustomer = await Customer.findOne({
      _id: { $ne: id },
      $or: duplicateConditions,
    });
    if (duplicateCustomer) {
      if (updateData.email && duplicateCustomer.email === updateData.email) {
        throw new Error("A customer with this email already exists.");
      }
      if (updateData.phone && duplicateCustomer.phone === updateData.phone) {
        throw new Error("A customer with this phone number already exists.");
      }
    }
  }
  if (updateData.firstName !== undefined || updateData.lastName !== undefined) {
    updateData.fullName =
      `${updateData.firstName ?? existingCustomer.firstName} ${
        updateData.lastName ?? existingCustomer.lastName
      }`.trim();
  }
  const customer = await Customer.findOneAndUpdate(
    {
      _id: id,
      status: "active",
    },
    updateData,
    {
      new: true,
      runValidators: true,
    },
  ).select("-passwordHash -__v");
  if (!customer) {
    throw new Error("Customer not found.");
  }
  return customer;
};
export const addCustomerAddressService = async (customerId, payload) => {
  const customer = await Customer.findOne({
    _id: customerId,
    status: "active",
  });
  if (!customer) {
    throw new Error("Customer not found.");
  }
  const isFirstAddress = customer.addresses.length === 0;
  const shouldBeDefault = payload.isDefault === true || isFirstAddress;
  if (shouldBeDefault) {
    customer.addresses.forEach((address) => {
      address.isDefault = false;
    });
  }
  customer.addresses.push({
    district: payload.district.trim(),
    thana: payload.thana.trim(),
    addressLine: payload.addressLine.trim(),
    isDefault: shouldBeDefault,
  });
  await customer.save();
  const address = customer.addresses[customer.addresses.length - 1];
  return address;
};
export const deleteCustomerService = async (id, updatedBy) => {
  const customer = await Customer.findOneAndUpdate(
    {
      _id: id,
      status: "active",
    },
    {
      status: "inactive",
      updatedBy,
    },
    {
      new: true,
    },
  );
  if (!customer) {
    throw new Error("Customer not found.");
  }
  return customer;
};
export const updateCustomerAddressService = async (
  customerId,
  addressId,
  payload,
) => {
  const customer = await Customer.findOne({
    _id: customerId,
    status: "active",
  });
  if (!customer) {
    throw new Error("Customer not found.");
  }
  const address = customer.addresses.id(addressId);
  if (!address) {
    throw new Error("Address not found.");
  }
  if (payload.district !== undefined) {
    address.district = payload.district.trim();
  }
  if (payload.thana !== undefined) {
    address.thana = payload.thana.trim();
  }
  if (payload.addressLine !== undefined) {
    address.addressLine = payload.addressLine.trim();
  }
  if (payload.isDefault === true) {
    customer.addresses.forEach((item) => {
      item.isDefault = false;
    });
    address.isDefault = true;
  }
  await customer.save();
  return address;
};
export const deleteCustomerAddressService = async (customerId, addressId) => {
  const customer = await Customer.findOne({
    _id: customerId,
    status: "active",
  });
  if (!customer) {
    throw new Error("Customer not found.");
  }
  const address = customer.addresses.id(addressId);
  if (!address) {
    throw new Error("Address not found.");
  }
  const wasDefault = address.isDefault;
  address.deleteOne();
  if (wasDefault && customer.addresses.length > 0) {
    customer.addresses[0].isDefault = true;
  }
  await customer.save();
  return customer.addresses;
};

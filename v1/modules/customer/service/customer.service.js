import bcrypt from "bcryptjs";

import Customer from "../model/customer.model.js";

export const createCustomerService = async (payload) => {
  const existingCustomer = await Customer.findOne({
    email: payload.email,
  });

  if (existingCustomer) {
    throw new Error("Customer already exists");
  }

  const passwordHash = await bcrypt.hash(
    payload.password,
    10
  );

  delete payload.password;

  const customer = await Customer.create({
    ...payload,
    passwordHash,
    fullName: `${payload.firstName} ${payload.lastName}`.trim(),
  });

  return customer;
};

export const getAllCustomersService = async ({
  page = 1,
  limit = 10,
}) => {
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
    throw new Error("Customer not found");
  }

  return customer;
};

export const updateCustomerService = async (
  id,
  payload
) => {
  if (payload.password) {
    payload.passwordHash = await bcrypt.hash(
      payload.password,
      10
    );

    delete payload.password;
  }

  if (
    payload.firstName !== undefined ||
    payload.lastName !== undefined
  ) {
    const existingCustomer = await Customer.findOne({
      _id: id,
      status: "active",
    });

    if (!existingCustomer) {
      throw new Error("Customer not found");
    }

    payload.fullName = `${
      payload.firstName ??
      existingCustomer.firstName
    } ${
      payload.lastName ??
      existingCustomer.lastName
    }`.trim();
  }

  const customer = await Customer.findOneAndUpdate(
    {
      _id: id,
      status: "active",
    },
    payload,
    {
      new: true,
      runValidators: true,
    }
  ).select("-passwordHash -__v");

  if (!customer) {
    throw new Error("Customer not found");
  }

  return customer;
};

export const deleteCustomerService = async (
  id,
  updatedBy
) => {
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
    }
  );

  if (!customer) {
    throw new Error("Customer not found");
  }

  return customer;
};
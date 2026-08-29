import Order from "../model/order.model.js";
import Customer from "../../customer/model/customer.model.js";
import Inventory from "../../inventory/model/inventory.model.js";
import Product from "../../product/model/product.model.js";
import Tenant from "../../tenant/model/tenant.model.js";

export const createOrderService = async (body, customerId = null) => {
  const session = await Order.startSession();

  try {
    session.startTransaction();

    const {
      customerId: bodyCustomerId,
      guestInfo,
      firstName,
      lastName,
      phone,
      email,
      items,
      pricing,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes,
      orderDate,
    } = body;

    const orderType = customerId ? "REGISTERED" : "GUEST";

    if (!["GUEST", "REGISTERED"].includes(orderType)) {
      throw new Error("Invalid order type.");
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Order must contain at least one item.");
    }

    let customerData = {};

    if (orderType === "REGISTERED") {
      if (!customerId) {
        throw new Error("Authentication is required.");
      }

      const customer = await Customer.findById(customerId).session(session);

      if (!customer) {
        throw new Error("Customer not found.");
      }

      if (bodyCustomerId && String(bodyCustomerId) !== String(customer._id)) {
        throw new Error("Customer does not match authenticated customer.");
      }

      const customerPhone = phone?.trim() || customer.phone?.trim() || "";

      if (!customerPhone) {
        throw new Error("Customer phone is required.");
      }

      customerData = {
        customerId: customer._id,
        firstName: firstName?.trim() || customer.firstName?.trim() || "",
        lastName: lastName?.trim() || customer.lastName?.trim() || "",
        fullName:
          `${firstName?.trim() || customer.firstName?.trim() || ""} ${lastName?.trim() || customer.lastName?.trim() || ""}`.trim(),
        email: email?.trim() || customer.email?.trim() || "",
        phone: customerPhone,
      };
    }

    if (orderType === "GUEST") {
      if (!guestInfo) {
        throw new Error("Guest information is required.");
      }

      const guestFirstName = guestInfo.firstName?.trim() || "";
      const guestLastName = guestInfo.lastName?.trim() || "";
      const guestPhone = guestInfo.phone?.trim() || "";
      const guestEmail = guestInfo.email?.trim()?.toLowerCase() || "";

      if (!guestFirstName) {
        throw new Error("Guest first name is required.");
      }

      if (!guestLastName) {
        throw new Error("Guest last name is required.");
      }

      if (!guestPhone) {
        throw new Error("Guest phone is required.");
      }

      let customer = await Customer.findOne({
        phone: guestPhone,
      }).session(session);

      if (!customer && guestEmail) {
        customer = await Customer.findOne({
          email: guestEmail,
        }).session(session);
      }

      if (!customer) {
        const newCustomerData = {
          firstName: guestFirstName,
          lastName: guestLastName,
          phone: guestPhone,
          passwordHash: "",
          isGuest: true,
          billingAddress,
          shippingAddress,
        };

        if (guestEmail) {
          newCustomerData.email = guestEmail;
        }

        const [newCustomer] = await Customer.create([newCustomerData], {
          session,
        });

        customer = newCustomer;
      }

      customerData = {
        customerId: customer._id,
        firstName: guestFirstName || customer.firstName?.trim() || "",
        lastName: guestLastName || customer.lastName?.trim() || "",
        fullName:
          `${guestFirstName || customer.firstName?.trim() || ""} ${guestLastName || customer.lastName?.trim() || ""}`.trim(),
        email: guestEmail || customer.email?.trim() || "",
        phone: customer.phone?.trim() || guestPhone,
        guestInfo: {
          firstName: guestFirstName || customer.firstName?.trim() || "",
          lastName: guestLastName || customer.lastName?.trim() || "",
          email: guestEmail || customer.email?.trim() || "",
          phone: customer.phone?.trim() || guestPhone,
        },
      };
    }

    const orderItems = [];
    const tenantMap = new Map();

    for (const item of items) {
      if (!item.productId) {
        throw new Error("Product ID is required.");
      }

      if (!item.inventoryId) {
        throw new Error("Inventory ID is required.");
      }

      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);
      const totalPrice = Number(item.totalPrice);

      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Invalid item quantity.");
      }

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        throw new Error("Invalid item unit price.");
      }

      if (!Number.isFinite(totalPrice) || totalPrice < 0) {
        throw new Error("Invalid item total price.");
      }

      const inventory = await Inventory.findById(item.inventoryId).session(
        session,
      );

      if (!inventory) {
        throw new Error(`Inventory not found: ${item.inventoryId}`);
      }

      if (!inventory.productId || !inventory.productId.equals(item.productId)) {
        throw new Error("Inventory does not belong to the product.");
      }

      const product = await Product.findById(inventory.productId).session(
        session,
      );

      if (!product) {
        throw new Error("Product not found.");
      }

      if (!inventory.tenantId) {
        throw new Error("Inventory is not associated with a tenant.");
      }

      const tenant = await Tenant.findById(inventory.tenantId).session(session);

      if (!tenant) {
        throw new Error("Tenant not found.");
      }

      let productName = "";

      if (product.productName) {
        if (typeof product.productName.get === "function") {
          productName =
            product.productName.get("en") ||
            [...product.productName.values()][0] ||
            "";
        } else if (typeof product.productName === "object") {
          productName =
            product.productName.en ||
            Object.values(product.productName).find(
              (value) => typeof value === "string" && value.trim(),
            ) ||
            "";
        } else if (typeof product.productName === "string") {
          productName = product.productName;
        }
      }

      const orderItem = {
        productId: product._id,
        inventoryId: inventory._id,
        tenantId: tenant._id,
        tenantName: tenant.businessName || "",
        productName,
        productSlug: product.productSlug || "",
        productImage: product.productImage || "",
        quantity,
        unitPrice,
        totalPrice,
      };

      orderItems.push(orderItem);

      const tenantKey = tenant._id.toString();

      if (!tenantMap.has(tenantKey)) {
        tenantMap.set(tenantKey, {
          tenantId: tenant._id,
          tenantName: tenant.businessName || "",
          tenantStatus: "pending",
          items: [],
        });
      }

      tenantMap.get(tenantKey).items.push({
        productId: product._id,
        inventoryId: inventory._id,
        productName,
        productImage: product.productImage || "",
        quantity,
      });
    }

    const tenantOrders = [...tenantMap.values()];

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const orderData = {
      orderNumber,
      orderType,
      orderDate: orderDate || new Date(),
      ...customerData,
      shippingAddress,
      billingAddress,
      items: orderItems,
      tenantOrders,
      pricing,
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "pending",
      notes: notes?.trim() || "",
      statusHistory: [
        {
          status: "pending",
          remarks: "Order Created",
          changedAt: new Date(),
        },
      ],
    };

    const [order] = await Order.create([orderData], { session });

    await session.commitTransaction();

    return order;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

export const getOrderByIdService = async (id, customerId = null) => {
  const filter = {
    _id: id,
    status: "active",
  };

  if (customerId) {
    filter.customerId = customerId;
  }

  const order = await Order.findOne(filter)
    .populate("customerId", "firstName lastName email phone isGuest")
    .populate("items.productId", "productSlug productImage")
    .populate("items.inventoryId")
    .populate("tenantOrders.tenantId", "businessName");

  if (!order) {
    throw new Error("Order not found.");
  }

  return order;
};

export const getOrdersService = async (
  {
    page = 1,
    limit = 20,
    search,
    orderStatus,
    paymentStatus,
    paymentMethod,
    orderType,
  },
  customerId = null,
) => {
  page = Math.max(Number(page) || 1, 1);
  limit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const filter = {
    status: "active",
  };

  if (customerId) {
    filter.customerId = customerId;
  }

  if (orderStatus) {
    filter.orderStatus = orderStatus;
  }

  if (paymentStatus) {
    filter.paymentStatus = paymentStatus;
  }

  if (paymentMethod) {
    filter.paymentMethod = paymentMethod;
  }

  if (orderType) {
    filter.orderType = orderType;
  }

  if (search?.trim()) {
    const searchValue = search.trim();

    filter.$or = [
      {
        orderNumber: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        fullName: {
          $regex: searchValue,
          $options: "i",
        },
      },
    ];
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    orders,
  };
};

export const updateOrderService = async (id, body, customerId = null) => {
  if (!customerId) {
    throw new Error("Authentication is required.");
  }

  const update = {};

  if (body.shippingAddress) {
    update.shippingAddress = body.shippingAddress;
  }

  if (body.billingAddress) {
    update.billingAddress = body.billingAddress;
  }

  if (body.pricing) {
    update.pricing = body.pricing;
  }

  if (body.paymentMethod) {
    update.paymentMethod = body.paymentMethod;
  }

  if (body.notes !== undefined) {
    update.notes = body.notes;
  }

  update.updatedBy = customerId;

  const order = await Order.findOneAndUpdate(
    {
      _id: id,
      customerId,
      status: "active",
    },
    update,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!order) {
    throw new Error("Order not found.");
  }

  return order;
};

export const updateOrderStatusService = async (
  orderId,
  body,
  userId = null,
) => {
  const { orderStatus, paymentStatus, remarks } = body;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found.");
  }

  order.orderStatus = orderStatus;
  order.paymentStatus = paymentStatus;
  order.updatedBy = userId;

  order.statusHistory.push({
    status: orderStatus,
    remarks,
    changedBy: userId,
    changedAt: new Date(),
  });

  await order.save();

  return order;
};

export const updateTenantOrderStatusService = async (
  orderId,
  tenantId,
  body,
  userId = null,
) => {
  const { tenantStatus, remarks } = body;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found.");
  }

  const tenantOrder = order.tenantOrders.find(
    (tenant) => tenant.tenantId && tenant.tenantId.equals(tenantId),
  );

  if (!tenantOrder) {
    throw new Error("Tenant order not found.");
  }

  tenantOrder.tenantStatus = tenantStatus;

  if (remarks !== undefined) {
    tenantOrder.remarks = remarks;
  }

  tenantOrder.updatedAt = new Date();
  order.updatedBy = userId;

  await order.save();

  return order;
};

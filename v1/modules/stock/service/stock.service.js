import Stock from "../model/stock.model.js";
export const createStockService = async (payload, userId = null) => {
  const stock = await Stock.create({
    ...payload,
    createdBy: userId,
  });
  return stock;
};
export const getStockByIdService = async (id) => {
  const stock = await Stock.findById(id)
    .populate("inventoryId")
    .populate("productId")
    .populate("warehouseId")
    .populate("tenantId");
  if (!stock) {
    throw new Error("Stock transaction not found.");
  }
  return stock;
};
export const getStocksService = async ({
  page = 1,
  limit = 20,
  inventoryId,
  productId,
  warehouseId,
  tenantId,
  transactionType,
}) => {
  page = Number(page);
  limit = Number(limit);

  const filter = {};

  if (inventoryId) filter.inventoryId = inventoryId;
  if (productId) filter.productId = productId;
  if (warehouseId) filter.warehouseId = warehouseId;
  if (tenantId) filter.tenantId = tenantId;
  if (transactionType) filter.transactionType = transactionType;

  const skip = (page - 1) * limit;

  const [stocks, total] = await Promise.all([
    Stock.find(filter)
      .populate("inventoryId")
      .populate("productId")
      .populate("warehouseId")
      .populate("tenantId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Stock.countDocuments(filter),
  ]);

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    stocks,
  };
};

export const getInventoryBalanceService = async (inventoryId) => {
  const transactions = await Stock.find({ inventoryId }).sort({
    createdAt: 1,
  });

  if (!transactions.length) {
    return {
      inventoryId,
      opening: 0,
      purchased: 0,
      reserved: 0,
      released: 0,
      sold: 0,
      returned: 0,
      damaged: 0,
      availableStock: 0,
      reservedStock: 0,
      transactions: [],
    };
  }

  let opening = 0;
  let purchased = 0;
  let reserved = 0;
  let released = 0;
  let sold = 0;
  let returned = 0;
  let damaged = 0;

  for (const transaction of transactions) {
    switch (transaction.transactionType) {
      case "OPENING":
        opening += transaction.quantity;
        break;

      case "PURCHASE":
        purchased += transaction.quantity;
        break;

      case "RESERVE":
        reserved += transaction.quantity;
        break;

      case "RELEASE":
        released += transaction.quantity;
        break;

      case "SALE":
        sold += transaction.quantity;
        break;

      case "RETURN":
        returned += transaction.quantity;
        break;

      case "DAMAGE":
        damaged += transaction.quantity;
        break;
    }
  }

  const availableStock =
    opening + purchased + returned + released - reserved - sold - damaged;

  const reservedStock = reserved - released - sold;

  return {
    inventoryId,
    availableStock,
    reservedStock,
    summary: {
      opening,
      purchased,
      reserved,
      released,
      sold,
      returned,
      damaged,
    },
    transactions,
  };
};
//update stock transaction not added as it is not a good practice to update stock transactions. If you want to update stock, you should create a new stock transaction with the updated quantity and transaction type.

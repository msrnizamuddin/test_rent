import PurchaseInvoice from "../model/purchase.invoice.model.js";
import tenantGetId from "../../../utils/tenentHalper.js";
import AccountHead from "../../account-head/model/account.head.model.js";
export const createPurchaseInvoiceService = async (payload) => {
  const tenant = await tenantGetId(payload.tenantId);

  if (!tenant) {
    throw new Error("Tenant not found.");
  }

  payload.tenantId = tenant._id;

  const exists = await PurchaseInvoice.findOne({
    tenantId: tenant._id,
    invoiceNumber: payload.invoiceNumber,
  });

  if (exists) {
    throw new Error("Invoice number already exists.");
  }
  await Promise.all(
    (payload.payments || []).map(async (payment) => {
      const accountHead = await AccountHead.findOne({
        _id: payment.accountHeadId,
        tenantId: tenant._id,
      });

      if (!accountHead) {
        throw new Error("Payment account head not found.");
      }
    }),
  );
  const invoice = await PurchaseInvoice.create(payload);

  return invoice;
};

export const getAllPurchaseInvoiceService = async (tenantId) => {
  const tenant = await tenantGetId(tenantId);

  if (!tenant) {
    throw new Error("Tenant not found.");
  }

  return await PurchaseInvoice.find({
    tenantId: tenant._id,
  })
    .populate("accountTransactionId")
    .populate("payments.accountHeadId", "accountName accountCode")
    .populate("invoiceItems.productId", "productName")
    .populate("invoiceItems.inventoryId", "sku")
    .populate("createdBy", "name")
    .sort({ invoiceDate: -1 })
    .lean();
};

export const getSinglePurchaseInvoiceService = async (tenantId, invoiceId) => {
  const tenant = await tenantGetId(tenantId);

  if (!tenant) {
    throw new Error("Tenant not found.");
  }

  const invoice = await PurchaseInvoice.findOne({
    _id: invoiceId,
    tenantId: tenant._id,
  })
    .populate("accountTransactionId")
    .populate("payments.accountHeadId", "accountName accountCode")
    .populate("invoiceItems.productId", "productName")
    .populate("invoiceItems.inventoryId", "sku")
    .populate("createdBy", "name")
    .lean();

  if (!invoice) {
    throw new Error("Purchase invoice not found.");
  }

  return invoice;
};

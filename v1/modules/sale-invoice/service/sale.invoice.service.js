import SaleInvoice from "../model/sale.invoice.model.js";
import tenantGetId from "../../../utils/tenentHalper.js";
import AccountHead from "../../account-head/model/account.head.model.js";
export const createSaleInvoiceService = async (payload) => {
  const tenant = await tenantGetId(payload.tenantId);

  if (!tenant) {
    throw new Error("Tenant not found.");
  }

  payload.tenantId = tenant._id;

  const exists = await SaleInvoice.findOne({
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
  const invoice = await SaleInvoice.create(payload);

  return invoice;
};

export const getAllSaleInvoiceService = async (tenantId) => {
  const tenant = await tenantGetId(tenantId);

  if (!tenant) {
    throw new Error("Tenant not found.");
  }

  return await SaleInvoice.find({
    tenantId: tenant._id,
  })
    .populate("customerId", "customerName")
    .populate("salesmanId", "employeeName")
    //.populate("salesTermId", "termName")
    .populate("payments.accountHeadId", "accountName accountCode")
    .populate("accountTransactionId")
    .populate("invoiceItems.productId", "productName")
    .populate("invoiceItems.inventoryId", "sku")
    .populate("createdBy", "name")
    .sort({ invoiceDate: -1 })
    .lean();
};

export const getSingleSaleInvoiceService = async (tenantId, invoiceId) => {
  const tenant = await tenantGetId(tenantId);

  if (!tenant) {
    throw new Error("Tenant not found.");
  }

  const invoice = await SaleInvoice.findOne({
    _id: invoiceId,
    tenantId: tenant._id,
  })
    .populate("customerId", "customerName")
    .populate("salesmanId", "employeeName")
    //.populate("salesTermId", "termName")
    .populate("payments.accountHeadId", "accountName accountCode")
    .populate("accountTransactionId")
    .populate("invoiceItems.productId", "productName")
    .populate("invoiceItems.inventoryId", "sku")
    .populate("createdBy", "name")
    .lean();

  if (!invoice) {
    throw new Error("Sale invoice not found.");
  }

  return invoice;
};

import AccountTransaction from "../model/account.transaction.model.js";
import AccountHead from "../../account-head/model/account.head.model.js";
import tenantGetId from "../../../utils/tenentHalper.js";

export const createAccountTransactionService = async (payload) => {
  const tenant = await tenantGetId(payload.tenantId);

  if (!tenant) {
    throw new Error("Tenant not found.");
  }

  payload.tenantId = tenant._id;

  const voucherExists = await AccountTransaction.findOne({
    tenantId: tenant._id,
    voucherNumber: payload.voucherNumber,
  });

  if (voucherExists) {
    throw new Error("Voucher number already exists.");
  }

  const ids = [
    ...new Set(payload.entries.map((e) => e.accountHeadId.toString())),
  ];

  const accountHeads = await AccountHead.find({
    _id: { $in: ids },
    tenantId: tenant._id,
    status: "active",
    allowTransaction: true,
  });

  if (accountHeads.length !== ids.length) {
    throw new Error(
      "One or more account heads are invalid or cannot receive transactions.",
    );
  }
  const transaction = await AccountTransaction.create(payload);

  return transaction;
};

export const getAllAccountTransactionService = async (tenantId) => {
  const tenant = await tenantGetId(tenantId);

  if (!tenant) {
    throw new Error("Tenant not found.");
  }

  return await AccountTransaction.find({
    tenantId: tenant._id,
  })
    .populate(
      "entries.accountHeadId",
      "accountName accountCode headType accountType",
    )
    .populate("createdBy", "name")
    .sort({ transactionDate: -1 })
    .lean();
};

export const getSingleAccountTransactionService = async (
  tenantId,
  transactionId,
) => {
  const tenant = await tenantGetId(tenantId);

  if (!tenant) {
    throw new Error("Tenant not found.");
  }

  const transaction = await AccountTransaction.findOne({
    _id: transactionId,
    tenantId: tenant._id,
  })
    .populate(
      "entries.accountHeadId",
      "accountName accountCode headType accountType",
    )
    .populate("createdBy", "name")
    .lean();

  if (!transaction) {
    throw new Error("Transaction not found.");
  }

  return transaction;
};

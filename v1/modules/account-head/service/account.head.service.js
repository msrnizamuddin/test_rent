import AccountHead from "../model/account.head.model.js";
import tenantGetId from "../../../utils/tenentHalper.js";

export const createAccountHeadService = async (payload) => {
  const tenant = await tenantGetId(payload.tenantId);
  if (!tenant) {
    throw new Error("Tenant not found.");
  }
  payload.tenantId = tenant._id;
  const accountHead = await AccountHead.create(payload);
  return accountHead;
};
export const getAllAccountHeadService = async (tenantId) => {
  const tenant = await tenantGetId(tenantId);
  if (!tenant) {
    throw new Error("Tenant not found.");
  }
  return await AccountHead.find({
    tenantId: tenant._id,
  })
    .populate("parentAccount", "accountName accountCode")
    .sort({ accountCode: 1 });
};
export const getSingleAccountHeadService = async (tenantId, accountHeadId) => {
  const tenant = await tenantGetId(tenantId);
  if (!tenant) {
    throw new Error("Tenant not found.");
  }
  const accountHead = await AccountHead.findOne({
    _id: accountHeadId,
    tenantId: tenant._id,
  }).populate("parentAccount", "accountName accountCode");
  if (!accountHead) {
    throw new Error("Account Head not found.");
  }
  return accountHead;
};
export const updateAccountHeadService = async (
  tenantId,
  accountHeadId,
  payload,
) => {
  const tenant = await tenantGetId(tenantId);

  if (!tenant) {
    throw new Error("Tenant not found.");
  }

  const accountHead = await AccountHead.findOneAndUpdate(
    {
      _id: accountHeadId,
      tenantId: tenant._id,
    },
    payload,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!accountHead) {
    throw new Error("Account Head not found.");
  }

  return accountHead;
};

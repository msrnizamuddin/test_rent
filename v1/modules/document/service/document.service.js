import Document from "../model/document.model.js";

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const getAll = async () => Document.getAll();

const search = async (query) => Document.search(query);

const getById = async (id) => {
  const doc = await Document.findById(id);
  if (!doc) throw buildError("Document not found", 404);
  return doc;
};

// A user only ever uploads/lists documents against their own account; a
// vehicle's documents go through the vehicle owner (superadmin/manager) —
// the ownerType/ownerId split matches how the frontend uploads profile vs.
// vehicle documents today.
const getMine = async (userId) => Document.findByOwner("user", userId);

const getByOwner = async (ownerType, ownerId) => Document.findByOwner(ownerType, ownerId);

const upload = async (requester, payload) => {
  const ownerType = payload.ownerType || "user";
  const ownerId = ownerType === "user" ? requester.id : payload.ownerId;

  if (ownerType === "vehicle" && requester.role === "customer") {
    throw buildError("Access denied", 403);
  }

  return Document.create({ ...payload, ownerType, ownerId });
};

const verify = async (id, verifiedById) => {
  const doc = await Document.setStatus(id, "verified", { verifiedById });
  if (!doc) throw buildError("Document not found", 404);
  return doc;
};

const reject = async (id, verifiedById, rejectionReason) => {
  const doc = await Document.setStatus(id, "rejected", { verifiedById, rejectionReason });
  if (!doc) throw buildError("Document not found", 404);
  return doc;
};

const remove = async (id) => {
  const deleted = await Document.deleteById(id);
  if (!deleted) throw buildError("Document not found", 404);
  return { deleted: true };
};

export default { getAll, search, getById, getMine, getByOwner, upload, verify, reject, remove };

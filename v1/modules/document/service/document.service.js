import Document from "../model/document.model.js";
import cloudinary from "../../../utils/cloudinary/index.js";

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
  const isAdmin = requester.role === "superadmin" || requester.role === "manager";

  if (ownerType === "vehicle" && requester.role === "customer") {
    throw buildError("Access denied", 403);
  }

  // Self-upload is the default (a driver/customer uploading their own
  // document never sends ownerId). An admin editing someone else's profile
  // can explicitly pass that user's id as ownerId to attach the document to
  // them instead of to the admin's own account.
  let ownerId = requester.id;
  if (ownerType === "user" && payload.ownerId && payload.ownerId !== requester.id) {
    if (!isAdmin) throw buildError("Access denied", 403);
    ownerId = payload.ownerId;
  } else if (ownerType === "vehicle") {
    ownerId = payload.ownerId;
  }

  return Document.create({ ...payload, ownerType, ownerId });
};

// Multipart variant: actually uploads the file to Cloudinary (the plain
// upload() above only ever accepted a fileUrl the client already had —
// nothing in this API previously did the actual upload) then records it
// the same way.
const uploadFile = async (requester, file, payload) => {
  if (!file) throw buildError("No file uploaded");
  if (!payload.category) throw buildError("category is required");

  const uploaded = await cloudinary.uploadFile(file);

  return upload(requester, { ...payload, fileUrl: uploaded.url });
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

export default { getAll, search, getById, getMine, getByOwner, upload, uploadFile, verify, reject, remove };

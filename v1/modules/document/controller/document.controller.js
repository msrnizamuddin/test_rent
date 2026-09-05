import documentService from "../service/document.service.js";

const handle = (fn) => async (req, res, next) => {
  try {
    const result = await fn(req, res);
    res.status(result.statusCode || 200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

// Safe "get everything" — no filters, no conditions (staff-only, see route).
export const getAll = handle(async () => {
  const data = await documentService.getAll();
  return { message: "All documents fetched successfully", data };
});

export const searchDocuments = handle(async (req) => {
  const data = await documentService.search(req.query);
  return { message: "Documents fetched successfully", data };
});

export const getMyDocuments = handle(async (req) => {
  const data = await documentService.getMine(req.user.id);
  return { message: "Your documents fetched successfully", data };
});

export const getDocumentsByOwner = handle(async (req) => {
  const data = await documentService.getByOwner(req.params.ownerType, req.params.ownerId);
  return { message: "Documents fetched successfully", data };
});

export const getDocumentById = handle(async (req) => {
  const data = await documentService.getById(req.params.documentId);
  return { message: "Document fetched successfully", data };
});

export const uploadDocument = handle(async (req) => {
  const data = await documentService.upload(req.user, req.body);
  return { statusCode: 201, message: "Document uploaded successfully", data };
});

export const verifyDocument = handle(async (req) => {
  const data = await documentService.verify(req.params.documentId, req.user.id);
  return { message: "Document verified successfully", data };
});

export const rejectDocument = handle(async (req) => {
  const data = await documentService.reject(req.params.documentId, req.user.id, req.body.rejectionReason);
  return { message: "Document rejected successfully", data };
});

export const deleteDocument = handle(async (req) => {
  const data = await documentService.remove(req.params.documentId);
  return { message: "Document deleted successfully", data };
});

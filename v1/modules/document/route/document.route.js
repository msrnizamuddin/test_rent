import express from "express";
import * as controller from "../controller/document.controller.js";

import {
  searchDocumentValidation,
  documentIdParamValidation,
  ownerParamValidation,
  uploadDocumentValidation,
  rejectDocumentValidation,
} from "../validation/document.validation.js";

import { validate } from "../../../middleware/validate.middleware.js";
import {
  authenticate,
  authorize,
} from "../../../middleware/authenticate.middleware.js";

const router = express.Router();

router.use(authenticate);

router.post("/", validate(uploadDocumentValidation), controller.uploadDocument);
router.get("/mine", controller.getMyDocuments);

router.get(
  "/all",
  authorize("superadmin", "manager"),
  controller.getAll,
);
router.get(
  "/",
  authorize("superadmin", "manager"),
  validate(searchDocumentValidation, "query"),
  controller.searchDocuments,
);
router.get(
  "/owner/:ownerType/:ownerId",
  authorize("superadmin", "manager"),
  validate(ownerParamValidation, "params"),
  controller.getDocumentsByOwner,
);

router.patch(
  "/:documentId/verify",
  authorize("superadmin", "manager"),
  validate(documentIdParamValidation, "params"),
  controller.verifyDocument,
);
router.patch(
  "/:documentId/reject",
  authorize("superadmin", "manager"),
  validate(documentIdParamValidation, "params"),
  validate(rejectDocumentValidation),
  controller.rejectDocument,
);
router.delete(
  "/:documentId",
  authorize("superadmin", "manager"),
  validate(documentIdParamValidation, "params"),
  controller.deleteDocument,
);

router.get(
  "/:documentId",
  validate(documentIdParamValidation, "params"),
  controller.getDocumentById,
);

export default router;

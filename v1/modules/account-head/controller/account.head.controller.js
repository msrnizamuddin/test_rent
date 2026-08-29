import asyncHandler from "express-async-handler";
import {
  createAccountHeadService,
  getAllAccountHeadService,
  getSingleAccountHeadService,
  updateAccountHeadService,
} from "../service/account.head.service.js";
export const createAccountHeadController = asyncHandler(async (req, res) => {
  const accountHead = await createAccountHeadService(req.body);

  res.status(201).json({
    success: true,
    message: "Account head created successfully.",
    data: accountHead,
  });
});

export const getAllAccountHeadController = asyncHandler(async (req, res) => {
  const accountHeads = await getAllAccountHeadService(req.query.tenantId);

  res.status(200).json({
    success: true,
    count: accountHeads.length,
    data: accountHeads,
  });
});
export const getSingleAccountHeadController = asyncHandler(async (req, res) => {
  const accountHead = await getSingleAccountHeadService(
    req.query.tenantId,
    req.params.id,
  );

  res.status(200).json({
    success: true,
    data: accountHead,
  });
});
export const updateAccountHeadController = asyncHandler(async (req, res) => {
  const accountHead = await updateAccountHeadService(
    req.query.tenantId,
    req.params.id,
    req.body,
  );

  res.status(200).json({
    success: true,
    message: "Account head updated successfully.",
    data: accountHead,
  });
});

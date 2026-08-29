import asyncHandler from "express-async-handler";

import {
  createSaleInvoiceService,
  getAllSaleInvoiceService,
  getSingleSaleInvoiceService,
} from "../service/sale.invoice.service.js";

export const createSaleInvoiceController = asyncHandler(async (req, res) => {
  const invoice = await createSaleInvoiceService(req.body);

  res.status(201).json({
    success: true,
    message: "Sale invoice created successfully.",
    data: invoice,
  });
});

export const getAllSaleInvoiceController = asyncHandler(async (req, res) => {
  const invoices = await getAllSaleInvoiceService(req.query.tenantId);

  res.status(200).json({
    success: true,
    count: invoices.length,
    data: invoices,
  });
});

export const getSingleSaleInvoiceController = asyncHandler(async (req, res) => {
  const invoice = await getSingleSaleInvoiceService(
    req.query.tenantId,
    req.params.id,
  );

  res.status(200).json({
    success: true,
    data: invoice,
  });
});

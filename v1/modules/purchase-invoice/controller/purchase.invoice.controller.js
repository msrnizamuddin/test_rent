import asyncHandler from "express-async-handler";

import {
  createPurchaseInvoiceService,
  getAllPurchaseInvoiceService,
  getSinglePurchaseInvoiceService,
} from "../service/purchase.invoice.service.js";

export const createPurchaseInvoiceController = asyncHandler(
  async (req, res) => {
    const invoice = await createPurchaseInvoiceService(req.body);

    res.status(201).json({
      success: true,
      message: "Purchase invoice created successfully.",
      data: invoice,
    });
  },
);

export const getAllPurchaseInvoiceController = asyncHandler(
  async (req, res) => {
    const invoices = await getAllPurchaseInvoiceService(req.query.tenantId);

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  },
);

export const getSinglePurchaseInvoiceController = asyncHandler(
  async (req, res) => {
    const invoice = await getSinglePurchaseInvoiceService(
      req.query.tenantId,
      req.params.id,
    );

    res.status(200).json({
      success: true,
      data: invoice,
    });
  },
);

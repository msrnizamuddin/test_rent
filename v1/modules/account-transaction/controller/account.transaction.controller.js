import asyncHandler from "express-async-handler";

import {
  createAccountTransactionService,
  getAllAccountTransactionService,
  getSingleAccountTransactionService,
} from "../service/account.transaction.service.js";

export const createAccountTransactionController = asyncHandler(
  async (req, res) => {
    const transaction = await createAccountTransactionService(req.body);

    res.status(201).json({
      success: true,
      message: "Account transaction created successfully.",
      data: transaction,
    });
  },
);

export const getAllAccountTransactionController = asyncHandler(
  async (req, res) => {
    const transactions = await getAllAccountTransactionService(
      req.query.tenantId,
    );

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  },
);

export const getSingleAccountTransactionController = asyncHandler(
  async (req, res) => {
    const transaction = await getSingleAccountTransactionService(
      req.query.tenantId,
      req.params.id,
    );

    res.status(200).json({
      success: true,
      data: transaction,
    });
  },
);

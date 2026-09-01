import invoiceService from "../service/invoice.service.js";

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

export const generateInvoice = handle(async (req) => {
  const data = await invoiceService.generateInvoice(req.body);
  return { statusCode: 201, message: "Invoice generated successfully", data };
});

export const getInvoiceByTripId = handle(async (req) => {
  const data = await invoiceService.getInvoiceByTripId(req.params.tripId, req.user);
  return { message: "Invoice fetched successfully", data };
});

export const getInvoiceById = handle(async (req) => {
  const data = await invoiceService.getInvoiceById(req.params.invoiceId, req.user);
  return { message: "Invoice fetched successfully", data };
});

export const listInvoices = handle(async (req) => {
  const data = await invoiceService.listInvoices(req.query);
  return { message: "Invoices fetched successfully", data };
});

export const getMyInvoices = handle(async (req) => {
  const data = await invoiceService.getMyInvoices(req.user.id);
  return { message: "Invoices fetched successfully", data };
});

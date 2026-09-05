import ticketService from "../service/ticket.service.js";

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

// Safe "get everything" — no filters, no conditions. Staff-only (see route).
export const getAll = handle(async () => {
  const data = await ticketService.getAll();
  return { message: "All tickets fetched successfully", data };
});

export const searchTickets = handle(async (req) => {
  const data = await ticketService.search(req.query);
  return { message: "Tickets fetched successfully", data };
});

export const getMyTickets = handle(async (req) => {
  const data = await ticketService.getMine(req.user.id);
  return { message: "Your tickets fetched successfully", data };
});

export const getTicketById = handle(async (req) => {
  const data = await ticketService.getById(req.params.ticketId, req.user);
  return { message: "Ticket fetched successfully", data };
});

export const createTicket = handle(async (req) => {
  const data = await ticketService.create(req.user.id, req.body);
  return { statusCode: 201, message: "Ticket submitted successfully", data };
});

export const replyTicket = handle(async (req) => {
  const data = await ticketService.reply(req.params.ticketId, req.body);
  return { message: "Reply sent successfully", data };
});

export const updateTicketStatus = handle(async (req) => {
  const data = await ticketService.updateStatus(req.params.ticketId, req.body.status);
  return { message: "Ticket status updated successfully", data };
});

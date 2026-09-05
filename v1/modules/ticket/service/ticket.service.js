import Ticket from "../model/ticket.model.js";

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const getAll = async () => Ticket.getAll();

const search = async (query) => Ticket.search(query);

const getById = async (id, requester) => {
  const ticket = await Ticket.findById(id);
  if (!ticket) throw buildError("Ticket not found", 404);

  const isOwner = ticket.userId === requester.id;
  const isStaff = requester.role === "superadmin" || requester.role === "manager";
  if (!isOwner && !isStaff) throw buildError("Access denied", 403);

  return ticket;
};

const getMine = async (userId) => Ticket.findByUser(userId);

const create = async (userId, payload) => Ticket.create(userId, payload);

const reply = async (id, payload) => {
  const ticket = await Ticket.updateById(id, {
    adminReply: payload.adminReply,
    status: payload.status || "in_progress",
  });
  if (!ticket) throw buildError("Ticket not found", 404);
  return ticket;
};

const updateStatus = async (id, status) => {
  const ticket = await Ticket.updateById(id, { status });
  if (!ticket) throw buildError("Ticket not found", 404);
  return ticket;
};

export default { getAll, search, getById, getMine, create, reply, updateStatus };

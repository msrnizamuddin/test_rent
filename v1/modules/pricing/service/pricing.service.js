import Pricing from "../model/pricing.model.js";

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const getAll = async () => Pricing.getAll();

const search = async (query) => Pricing.search(query);

const getById = async (id) => {
  const rule = await Pricing.findById(id);
  if (!rule) throw buildError("Pricing rule not found", 404);
  return rule;
};

const create = async (payload) => Pricing.create(payload);

const update = async (id, payload) => {
  const rule = await Pricing.updateById(id, payload);
  if (!rule) throw buildError("Pricing rule not found", 404);
  return rule;
};

const remove = async (id) => {
  const deleted = await Pricing.deleteById(id);
  if (!deleted) throw buildError("Pricing rule not found", 404);
  return { deleted: true };
};

export default { getAll, search, getById, create, update, remove };

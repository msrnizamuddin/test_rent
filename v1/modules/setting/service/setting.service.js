import Setting from "../model/setting.model.js";

const ALLOWED_KEYS = new Set([
  "general",
  "business",
  "notification",
]);

const buildError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const getAll = async () => Setting.getAll();

const getByKey = async (key) => {
  if (!ALLOWED_KEYS.has(key)) throw buildError("Unknown setting key", 404);
  const value = await Setting.get(key);
  return value ?? {};
};

const update = async (key, value) => {
  if (!ALLOWED_KEYS.has(key)) throw buildError("Unknown setting key", 404);
  const row = await Setting.set(key, value);
  return row.value;
};

export default { getAll, getByKey, update };

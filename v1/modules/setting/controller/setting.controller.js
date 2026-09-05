import settingService from "../service/setting.service.js";

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

// Safe "get everything" — every setting key, no filters.
export const getAll = handle(async () => {
  const data = await settingService.getAll();
  return { message: "All settings fetched successfully", data };
});

export const getByKey = handle(async (req) => {
  const data = await settingService.getByKey(req.params.key);
  return { message: "Setting fetched successfully", data };
});

export const updateSetting = handle(async (req) => {
  const data = await settingService.update(req.params.key, req.body);
  return { message: "Setting updated successfully", data };
});

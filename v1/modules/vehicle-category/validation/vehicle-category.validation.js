import Joi from "joi";

const objectId = Joi.string().guid({ version: "uuidv4" });

export const searchCategoryValidation = Joi.object({
  status: Joi.string().valid("active", "inactive").optional(),
});

export const categoryIdParamValidation = Joi.object({
  categoryId: objectId.required(),
});

export const createCategoryValidation = Joi.object({
  name: Joi.string().trim().required(),
  description: Joi.string().trim().allow("", null).optional(),
  image: Joi.string().uri().optional(),
  status: Joi.string().valid("active", "inactive").optional(),
});

export const updateCategoryValidation = Joi.object({
  name: Joi.string().trim(),
  description: Joi.string().trim().allow("", null),
  image: Joi.string().uri(),
  status: Joi.string().valid("active", "inactive"),
}).min(1);

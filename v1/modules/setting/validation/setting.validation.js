import Joi from "joi";

export const settingKeyParamValidation = Joi.object({
  key: Joi.string().valid("general", "business", "notification").required(),
});

// The settings payload is an intentionally open object (currency, tax rate,
// website name, etc.) — validating its shape lives with each key's own
// meaning, not here. Just require an object.
export const updateSettingValidation = Joi.object().min(1);

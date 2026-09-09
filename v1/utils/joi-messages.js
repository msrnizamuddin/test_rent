// Joi's default "required" error ("\"fieldName\" is required") leaks the
// raw camelCase key name to the client. Chain `.required().messages(requiredMessage("Label"))`
// on any required field to return a clean, human-readable message instead.
// The extra keys are harmless no-ops on types that can't trigger them (e.g.
// "string.empty" never fires for a Joi.number()).
export const requiredMessage = (label) => ({
  "any.required": `${label} is required`,
  "string.empty": `${label} is required`,
  "array.base": `${label} is required`,
  "object.base": `${label} is required`,
});

import Joi from "joi";

const socialMediaLinkSchema = Joi.object({
  platform: Joi.string().trim(),
  url: Joi.string().uri().trim(),
});

const bankDetailSchema = Joi.object({
  bankName: Joi.string().trim(),
  accountName: Joi.string().trim(),
  accountNumber: Joi.string().trim(),
  branchName: Joi.string().trim(),
  routingNumber: Joi.string().trim(),
});

// MongoDB ObjectId validation (24-character hex string)
const objectIdSchema = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    "string.pattern.base": "Invalid ID format. Must be a valid 24-character MongoDB ID.",
  });

export const updateTenantSchema = Joi.object({
  fullName: Joi.string().trim().optional(),
  businessName: Joi.string().trim().allow("").optional(),

  languages: Joi.array().items(objectIdSchema).optional(),

  businessEmail: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^\S+@\S+\.\S+$/)
    .optional()
    .messages({
      "string.pattern.base": "Invalid email format.",
    }),

  businessPhone: Joi.string().trim().allow("").optional(),
  businessWebsite: Joi.string().uri().trim().allow("").optional(),
  businessAddress: Joi.string().trim().allow("").optional(),
  contactPageEmail: Joi.string().trim().lowercase().email().allow("").optional(),

  centralStatus: Joi.string().valid("active", "inactive").optional(),
  isVerified: Joi.boolean().optional(),

  logo: Joi.string().uri().allow("").optional(),
  favicon: Joi.string().uri().allow("").optional(),
  invoiceLogo: Joi.string().uri().allow("").optional(),

  socialMediaLinks: Joi.array().items(socialMediaLinkSchema).optional(),
  bankDetails: Joi.array().items(bankDetailSchema).optional(),

  invoiceFooterNotes: Joi.string().trim().allow("").optional(),
  websiteFooterNotes: Joi.string().trim().allow("").optional(),

  seoMetaTitle: Joi.string().trim().allow("").optional(),
  seoMetaDescription: Joi.string().trim().allow("").optional(),
  seoKeywords: Joi.array().items(Joi.string().trim()).optional(),

  clientType: Joi.array().items(Joi.string().trim()).optional(),
})
  .min(1)
  .unknown(false)
  .messages({
    "object.min": "At least one field is required to update.",
    "object.unknown": "{{#label}} is not allowed to be updated.",
  });
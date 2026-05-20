import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    price: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    color: { type: String, unique: [true, "Color already exists"] },
    size: { type: String, unique: [true, "Size already exists"] },
  },
  { timestamps: true, versionKey: false },
);

export const Variant = mongoose.model("Variant", variantSchema);

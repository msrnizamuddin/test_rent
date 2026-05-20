import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: [true, "Category name already exists"],
      trim: true,
    },
    image: { type: String, required: [true, "Category image is required"] },
  },
  { timestamps: true, versionKey: false },
);
export const Category = mongoose.model("Category", categorySchema);

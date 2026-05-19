import mongoose from "mongoose";
const cartSchema = new mongoose.Schema(
  {
    user: {
      required: [true, "User is required"],
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    product: {
      required: [true, "Product is required"],
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
    },
    quantity: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Cart = mongoose.model("Cart", cartSchema);
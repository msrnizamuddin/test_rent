import mongoose from "mongoose";

const { Schema } = mongoose;

const imageGallerySchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: [true, "Tenant is required"],
      index: true,
    },
    centralStatus: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    imagePublicId: {
      type: String,
      required: [true, "Image public ID is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const ImageGallery = mongoose.model("ImageGallery", imageGallerySchema);

export default ImageGallery;

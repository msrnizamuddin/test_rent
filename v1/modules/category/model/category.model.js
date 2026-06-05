import mongoose from 'mongoose';

const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    tenantId: {
      type: String, // UUID
      required: true,
      index: true,
    },
    type : {
      type : String,
      required : true,
      enum : "Parent" 
    },
    centralStatus: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    name: {
      en: { type: String, trim: true },
      ar: { type: String, trim: true },
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    profileImage: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model('Category', categorySchema);
export default Category;
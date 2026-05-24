import mongoose from 'mongoose';

const { Schema } = mongoose;

const brandSchema = new Schema(
    {
        tenantId: {
            type: String, // UUID
            required: true,
            index: true,
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
            unique: true,
            trim: true,
        },
        profileImage: {
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

const Brand = mongoose.model('Brand', brandSchema);
export default Brand;
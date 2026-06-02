import mongoose from 'mongoose';

const { Schema } = mongoose;

// sub-schema for sizes
const sizeSchema = new Schema(
    {
        tenantId: { type: String },
        centralStatus: { type: String, enum: ['active', 'inactive'], default: 'active' },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        name: {
            en: { type: String, trim: true },
            ar: { type: String, trim: true },
        },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { _id: true }
);

// main inventory schema
const inventorySchema = new Schema(
    {
        warehouseId: {
            type: Schema.Types.ObjectId,
            ref: 'Warehouse',
            required: true,
        },
        sizes: [sizeSchema], // embedded sizes array
        color: {
            type: String,
            trim: true,
        },
        colorImage: {
            type: String,
        },
        sku: {
            type: String,
            trim: true,
        },
        productPurchasePrice: {
            type: Number,
            min: 0,
        },
        basePrice: {
            type: Number,
            min: 0,
        },
        productOpeningStock: {
            type: Number,
            min: 0,
            default: 0,
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

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
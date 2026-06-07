import mongoose from 'mongoose';

const { Schema } = mongoose;


// main inventory schema
const inventorySchema = new Schema(
    {
        warehouseId: {
            type: Schema.Types.ObjectId,
            ref: 'Warehouse',
            required: true,
        },
        sizeId: {
            type: Schema.Types.ObjectId,
            ref: 'Size',
            required: true,
        },
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
            
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            
        },
    },
    {
        timestamps: true,
    }
);

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
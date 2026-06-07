import mongoose from 'mongoose';

const { Schema } = mongoose;

<<<<<<< Updated upstream
=======
// sub-schema for sizes

>>>>>>> Stashed changes

// main inventory schema
const inventorySchema = new Schema(
    {
        warehouseId: {
            type: Schema.Types.ObjectId,
            ref: 'Warehouse',
            required: true,
        },
<<<<<<< Updated upstream
        sizeId: {
            type: Schema.Types.ObjectId,
            ref: 'Size',
            required: true,
        },
=======
        sizes: {
            type : Schema.Types.ObjectId
        }, // embedded sizes array
>>>>>>> Stashed changes
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
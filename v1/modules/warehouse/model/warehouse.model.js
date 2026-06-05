import mongoose from 'mongoose';

const { Schema } = mongoose;

const warehouseSchema = new Schema(
    {
        tenantId: {
<<<<<<< HEAD
            type: String, // UUID
            required: true,
            index: true,
=======
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
            required: true,
>>>>>>> cf94805cef18f136ac105c901ecd924668c43c91
        },
        centralStatus: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        location: {
            type: String,
            trim: true,
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

const Warehouse = mongoose.model('Warehouse', warehouseSchema);
export default Warehouse;
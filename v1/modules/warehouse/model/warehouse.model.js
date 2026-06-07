import mongoose from 'mongoose';

const { Schema } = mongoose;

const warehouseSchema = new Schema(
    {
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tenant",
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
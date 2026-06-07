import mongoose from 'mongoose';
import { v4 as uuidv4 } from "uuid";
const { Schema } = mongoose;

const warehouseSchema = new Schema(
    {
        
        tenantId: {
            type: String,
            unique: true,
            required: true,
            default: uuidv4,
            immutable: true,
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
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
        },
    },
    {
        timestamps: true,
    }
);

const Warehouse = mongoose.model('Warehouse', warehouseSchema);
export default Warehouse;
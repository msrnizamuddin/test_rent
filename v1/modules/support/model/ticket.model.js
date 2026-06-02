import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    tenantId: { 
        type: String, 
        required: true, 
        index: true 
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium"
    },
    status: {
        type: String,
        enum: ["open", "in_progress", "resolved", "closed"],
        default: "open"
    }
}, { timestamps: true });

export const Ticket = mongoose.model("Ticket", ticketSchema);
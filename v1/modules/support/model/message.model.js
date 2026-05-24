import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    tenantId: { type: String, required: true, index: true },
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const SupportMessage = mongoose.model("SupportMessage", messageSchema);
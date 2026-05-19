import mongoose from "mongoose";

// support ticket/token
const ticketSchema = new mongoose.Schema({
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
    },
    isLiveChat: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// support message
const messageSchema = new mongoose.Schema({
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SupportTicket",
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

const Ticket = mongoose.model("SupportTicket", ticketSchema);
const Message = mongoose.model("SupportMessage", messageSchema);

export { Ticket, Message };
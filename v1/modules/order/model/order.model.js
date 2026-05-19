import mongoose from "mongoose";

export const OrderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [{
        productName: String,
        price: Number,
        quantity: {type: Number, default: 1}
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered"],
        default: "pending"
    },
    shippingAddress: {
        street: String,
        city: String,
        postalCode: String,
        country: String
    },
    paymentInfo: {
        type: String,
        enum: ["paid", "unpaid", "refunded"],
        default: "unpaid"
    }
    
}, {
    timestamps: true
});

export default mongoose.model("order", OrderSchema);

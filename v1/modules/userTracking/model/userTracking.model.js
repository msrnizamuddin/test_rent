// model/userTracking.model.js

import mongoose from "mongoose";
import { logModule } from '../../../utils/moduleLogger.js';
logModule(import.meta.url);
const userTrackingSchema = new mongoose.Schema(
  {
    // Optional if user is logged in
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        default: null,
    },
    // Network
    ip: {
        type: String,
        trim: true,
    },
    // Browser Information
    userAgent: {
        type: String,
        trim: true,
    },
    browserName: {
        type: String,
        trim: true,
    },
    browserVersion: {
        type: String,
        trim: true,
    },
    // Operating System
    osName: {
        type: String,
        trim: true,
    },
    osVersion: {
        type: String,
        trim: true,
    },
    // Device Information
    deviceType: {
        type: String,
        enum: ["mobile", "tablet", "desktop", "smarttv", "console", "wearable", "unknown"],
        default: "unknown",
    },
    deviceVendor: {
        type: String,
        trim: true,
    },
    country: {
        type: String,
        trim: true,
    },
    city: {
        type: String,
        trim: true,
    },
    deviceModel: {
        type: String,
        trim: true,
    },
    // Localization
    language: {
        type: String,
        trim: true,
    },
    timezone: {
        type: String,
        trim: true,
    },
    // Screen Information (sent from frontend)
    screenWidth: Number,

    screenHeight: Number,
    // Navigation
    currentUrl: {
        type: String,
        trim: true,
    },
    referrer: {
        type: String,
        trim: true,
    },
    // Event Information
    eventType: {
        type: String,
        enum: [
            "page_view",
            "login",
            "logout",
            "register",
            "api_call",
            "error",
            "custom",
        ],
        default: "page_view",
    },
    eventName: {
        type: String,
        trim: true,
    },
    // Additional debugging information
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
  },
  {
    timestamps: true,
  }
);
const UserTracking = mongoose.model(
    "UserTracking",
    userTrackingSchema
);

export default UserTracking;
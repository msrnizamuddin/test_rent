import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    // ---------------- 2.3 Vehicle Details ----------------
    vehicleName: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    vehicleModel: {
      type: String,
      required: true,
      trim: true,
    },

    // ref to Vehicle Category Module (module 20); kept as plain string fallback
    // until that module exists, so this model works standalone for now
    category: {
      type: String,
      required: true,
      trim: true,
      // e.g. Sedan, SUV, Microbus, Minibus, Bus, Premium, Luxury, Corporate, Family, Executive
    },

    vehicleType: {
      type: String,
      required: true,
      enum: [
        "sedan",
        "suv",
        "hatchback",
        "microbus",
        "minibus",
        "bus",
        "pickup",
        "van",
        "coaster",
        "other",
      ],
    },

    images: {
      type: [String],
      default: [],
    },

    registrationNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    modelYear: {
      type: Number,
      required: true,
    },

    seatingCapacity: {
      type: Number,
      required: true,
    },

    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "cng", "electric", "hybrid"],
      required: true,
    },

    transmission: {
      type: String,
      enum: ["manual", "automatic"],
      required: true,
    },

    isAC: {
      type: Boolean,
      default: true,
    },

    features: {
      type: [String],
      default: [], // e.g. "Bluetooth", "GPS", "Sunroof", "Child Seat"
    },

    location: {
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      district: { type: String, trim: true },
      latitude: { type: Number },
      longitude: { type: Number },
    },

    // shown to users during browsing as an estimate; final pricing rules
    // live in the Pricing & Fare Management module
    estimatedRentalRate: {
      perDay: { type: Number },
      perHour: { type: Number },
      perKm: { type: Number },
    },

    // Vehicle Status (module 7) — "available"/"on-trip" etc. gate browsing visibility
    availabilityStatus: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "available",
        "assigned",
        "on-trip",
        "maintenance",
        "inactive",
      ],
      default: "pending",
    },

    color: {
      type: String,
      trim: true,
    },

    driverRequired: {
      type: Boolean,
      default: false,
    },

    ownerInfo: {
      name: { type: String, trim: true },
      contactNumber: { type: String, trim: true },
      nidNumber: { type: String, trim: true },
    },

    documents: [
      {
        title: { type: String, trim: true }, // e.g. Registration, Fitness, Insurance, Tax Token
        fileUrl: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // audit — populated once the Entry & Approval module (7) wires this up
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Search & filter performance
vehicleSchema.index({ vehicleName: "text", brand: "text" });
vehicleSchema.index({ category: 1 });
vehicleSchema.index({ vehicleType: 1 });
vehicleSchema.index({ "location.city": 1 });
vehicleSchema.index({ availabilityStatus: 1 });

export default mongoose.model("Vehicle", vehicleSchema);

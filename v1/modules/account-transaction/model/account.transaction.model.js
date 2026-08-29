import mongoose from "mongoose";

const { Schema } = mongoose;

const transactionLineSchema = new Schema(
  {
    accountHeadId: {
      type: Schema.Types.ObjectId,
      ref: "AccountHead",
      required: true,
    },

    txType: {
      type: String,
      enum: ["DEBIT", "CREDIT"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const accountTransactionSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    voucherNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    voucherType: {
      type: String,
      enum: [
        "JV", // Journal Voucher
        "PV", // Payment Voucher
        "RV", // Receipt Voucher
        "SV", // Sales Voucher
        "PRV", // Purchase Voucher
        "CV", // Contra Voucher
        "OB", // Opening Balance
        "CN", // Credit Note
        "DN", // Debit Note
      ],
      required: true,
    },

    transactionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    referenceNumber: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    entries: {
      type: [transactionLineSchema],
      required: true,
      validate: {
        validator: (v) => v.length >= 2,
        message: "Transaction must have at least two entries.",
      },
    },

    totalDebit: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalCredit: {
      type: Number,
      default: 0,
      min: 0,
    },

    sourceModule: {
      type: String,
      enum: [
        "SALES",
        "PURCHASE",
        "PAYMENT",
        "RECEIPT",
        "JOURNAL",
        "POS",
        "OPENING_BALANCE",
      ],
    },

    referenceId: {
      type: Schema.Types.ObjectId,
    },

    status: {
      type: String,
      enum: ["PENDING", "POSTED", "CANCELLED"],
      default: "POSTED",
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

accountTransactionSchema.pre("save", function () {
  const debit = this.entries
    .filter((e) => e.txType === "DEBIT")
    .reduce((sum, e) => sum + e.amount, 0);

  const credit = this.entries
    .filter((e) => e.txType === "CREDIT")
    .reduce((sum, e) => sum + e.amount, 0);

  if (debit !== credit) {
    return next(new Error("Debit and Credit must be equal."));
  }

  this.totalDebit = debit;
  this.totalCredit = credit;
});

const AccountTransaction = mongoose.model(
  "AccountTransaction",
  accountTransactionSchema,
);

export default AccountTransaction;

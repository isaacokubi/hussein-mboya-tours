// server/models/Payment.js

import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

/*
|--------------------------------------------------------------------------
| PAYMENT SCHEMA
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| PAYMENT IDEMPOTENCY INDEXES
|--------------------------------------------------------------------------
| Prevent duplicate M-Pesa transaction records.
|--------------------------------------------------------------------------
*/

const paymentSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    provider: {
      type: String,
      enum: [
        "MPESA",
        "STRIPE",
        "PAYPAL",
        "BANK",
        "CASH",
      ],
      default: "MPESA",
    },

    method: {
      type: String,
      enum: [
        "mpesa",
        "card",
        "paypal",
        "bank",
        "cash",
      ],
      default: "mpesa",
    },

    /*
    |--------------------------------------------------------------------------
    | PAYMENT METHOD
    |--------------------------------------------------------------------------
    | Accept both the legacy human-readable values and the canonical values
    | used by the payment lifecycle service. This prevents M-Pesa STK payment
    | creation/callbacks from failing Mongoose validation.
    |--------------------------------------------------------------------------
    */

    paymentMethod: {
      type: String,
      enum: [
        "MPESA",
        "CARD",
        "PAYPAL",
        "BANK_TRANSFER",
        "CASH",
        "M-Pesa",
        "Cash",
        "Card",
        "Bank",
        "PayPal",
      ],
      default: "MPESA",
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: (value) => Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 1000000000,
        message: "Invalid payment amount.",
      },
    },

    currency: {
      type: String,
      default: "KES",
      uppercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    phoneNumber: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },

    transactionId: {
      type: String,
      trim: true,
      default: "",
    },

    transactionReference: {
      type: String,
      trim: true,
      default: "",
    },

    invoiceNumber: {
      type: String,
      trim: true,
      default: "",
    },

    merchantRequestID: String,
    merchantRequestId: String,

    checkoutRequestID: String,
    checkoutRequestId: String,

    mpesaReceiptNumber: String,

    transactionDate: String,

    callbackResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    failureReason: {
      type: String,
      default: "",
    },

    failedAt: {
      type: Date,
      default: null,
    },

    refundRequestedAt: {
      type: Date,
    },

    refundStatus: {
      type: String,
      enum: [
        "none",
        "requested",
        "processing",
        "completed",
        "failed",
      ],
      default: "none",
    },

    refundReference: {
      type: String,
      default: "",
    },

    refundedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundRequestedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    paidAt: Date,

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

paymentSchema.virtual("isSuccessful").get(function () {
  return this.status === "completed";
});

paymentSchema.virtual("isRefunded").get(function () {
  return this.refundStatus === "completed";
});

paymentSchema.index({
  customer: 1,
  createdAt: -1,
});

paymentSchema.index({
  booking: 1,
});

paymentSchema.index({
  status: 1,
  provider: 1,
});

paymentSchema.index({
  transactionId: 1,
});

paymentSchema.index({
  transactionReference: 1,
});

paymentSchema.index(
  { provider: 1, transactionReference: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "completed",
      transactionReference: { $type: "string", $gt: "" },
    },
  }
);

paymentSchema.index(
  {
    checkoutRequestID: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

paymentSchema.index(
  {
    checkoutRequestId: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

paymentSchema.index(
  {
    mpesaReceiptNumber: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

paymentSchema.methods.markCompleted = function (
  receiptNumber,
  transactionId = ""
) {
  this.status = "completed";
  this.mpesaReceiptNumber = receiptNumber;
  this.transactionId = transactionId;
  this.paidAt = new Date();

  return this.save();
};

paymentSchema.methods.markFailed = function (reason) {
  this.status = "failed";
  this.failureReason = reason;

  return this.save();
};

const Payment =
  mongoose.models.Payment ||
  paymentSchema.plugin(tenantPlugin);

mongoose.model("Payment", paymentSchema);

export default Payment;
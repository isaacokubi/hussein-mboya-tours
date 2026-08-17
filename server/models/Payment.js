// server/models/Payment.js

import mongoose from "mongoose";

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
    /*
    |--------------------------------------------------------------------------
    | CUSTOMER
    |--------------------------------------------------------------------------
    */

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Backward compatibility
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    /*
    |--------------------------------------------------------------------------
    | BOOKING
    |--------------------------------------------------------------------------
    */

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    /*
    |--------------------------------------------------------------------------
    | PAYMENT PROVIDER
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | PAYMENT METHOD
    |--------------------------------------------------------------------------
    */

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
    | LEGACY SUPPORT
    |--------------------------------------------------------------------------
    */

    paymentMethod: {
      type: String,
      enum: [
        "M-Pesa",
        "Cash",
        "Card",
        "Bank",
        "PayPal",
      ],
      default: "M-Pesa",
    },

    /*
    |--------------------------------------------------------------------------
    | PAYMENT DETAILS
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | REFERENCES
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | M-PESA DATA
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | FAILURE
    |--------------------------------------------------------------------------
    */

    failureReason: {
      type: String,
      default: "",
    },

    failedAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | REFUND
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | PAYMENT DATE
    |--------------------------------------------------------------------------
    */

    paidAt: Date,

    /*
    |--------------------------------------------------------------------------
    | NOTES
    |--------------------------------------------------------------------------
    */

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

/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/

paymentSchema.virtual("isSuccessful").get(function () {
  return this.status === "completed";
});

paymentSchema.virtual("isRefunded").get(function () {
  return this.refundStatus === "completed";
});

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

// Customer payments
paymentSchema.index({
  customer: 1,
  createdAt: -1,
});

// Booking payments
paymentSchema.index({
  booking: 1,
});

// Analytics
paymentSchema.index({
  status: 1,
  provider: 1,
});

// Transaction lookup
paymentSchema.index({
  transactionId: 1,
});

paymentSchema.index({
  transactionReference: 1,
});

// A provider transaction reference must never be credited twice. This is
// intentionally limited to completed records so pending bank references can
// still be submitted while awaiting reconciliation.
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

// M-Pesa callbacks
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

// Receipt lookup
paymentSchema.index(
  {
    mpesaReceiptNumber: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

/*
|--------------------------------------------------------------------------
| METHODS
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

const Payment =
  mongoose.models.Payment ||
  mongoose.model("Payment", paymentSchema);

export default Payment;
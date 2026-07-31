import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | USER
    |--------------------------------------------------------------------------
    */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER
    |--------------------------------------------------------------------------
    */
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
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
      enum: ["MPESA", "STRIPE", "PAYPAL"],
      required: true,
    },

    /*
    |--------------------------------------------------------------------------
    | PAYMENT METHOD
    |--------------------------------------------------------------------------
    */
    method: {
      type: String,
      enum: ["mpesa", "card", "bank"],
      required: true,
    },

    /*
    |--------------------------------------------------------------------------
    | AMOUNT
    |--------------------------------------------------------------------------
    */
    amount: {
      type: Number,
      required: true,
      min: 0,
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
        "completed",
        "failed",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },

    /*
    |--------------------------------------------------------------------------
    | GENERAL TRANSACTION
    |--------------------------------------------------------------------------
    */
    transactionId: {
      type: String,
      default: "",
    },

    transactionReference: {
      type: String,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | MPESA DETAILS
    |--------------------------------------------------------------------------
    */
    merchantRequestID: {
      type: String,
      default: "",
    },

    checkoutRequestID: {
      type: String,
      default: "",
    },

    mpesaReceiptNumber: {
      type: String,
      default: "",
    },

    transactionDate: {
      type: String,
      default: "",
    },

    phoneNumber: {
      type: String,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | CALLBACK RESPONSE
    |--------------------------------------------------------------------------
    */
    resultCode: {
      type: Number,
      default: null,
    },

    resultDescription: {
      type: String,
      default: "",
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

    /*
    |--------------------------------------------------------------------------
    | PAYMENT DATE
    |--------------------------------------------------------------------------
    */
    paidAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | REFUND
    |--------------------------------------------------------------------------
    */
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

    refundAmount: {
      type: Number,
      default: 0,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | NOTES
    |--------------------------------------------------------------------------
    */
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

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
    mpesaReceiptNumber: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

paymentSchema.index({
  booking: 1,
});

paymentSchema.index({
  customer: 1,
});

paymentSchema.index({
  user: 1,
});

paymentSchema.index({
  status: 1,
});

paymentSchema.index({
  provider: 1,
});

paymentSchema.index({
  transactionId: 1,
});

paymentSchema.index({
  createdAt: -1,
});

const Payment =
  mongoose.models.Payment ||
  mongoose.model("Payment", paymentSchema);

export default Payment;
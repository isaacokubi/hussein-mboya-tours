// server/models/Invoice.js

import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| INVOICE SCHEMA
|--------------------------------------------------------------------------
*/

const invoiceSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | BOOKING
    |--------------------------------------------------------------------------
    */

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER
    |--------------------------------------------------------------------------
    */

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /*
    |--------------------------------------------------------------------------
    | TOUR
    |--------------------------------------------------------------------------
    */

    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },

    /*
    |--------------------------------------------------------------------------
    | AGENT (OPTIONAL)
    |--------------------------------------------------------------------------
    */

    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | INVOICE DETAILS
    |--------------------------------------------------------------------------
    */

    invoiceNumber: {
      type: String,
      unique: true,
      trim: true,
    },

    issueDate: {
      type: Date,
      default: Date.now,
    },

    dueDate: {
      type: Date,
    },

    /*
    |--------------------------------------------------------------------------
    | AMOUNTS
    |--------------------------------------------------------------------------
    */

    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | PAYMENT
    |--------------------------------------------------------------------------
    */

    paymentMethod: {
      type: String,
      enum: [
        "MPESA",
        "CARD",
        "BANK_TRANSFER",
        "PAYPAL",
        "CASH",
      ],
      default: "MPESA",
    },

    paymentReference: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    status: {
      type: String,
      enum: [
        "draft",
        "pending",
        "partial",
        "paid",
        "cancelled",
        "refunded",
        "overdue",
      ],
      default: "pending",
    },

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER SNAPSHOT
    |--------------------------------------------------------------------------
    */

    customerSnapshot: {
      name: String,
      email: String,
      phone: String,
    },

    /*
    |--------------------------------------------------------------------------
    | PDF
    |--------------------------------------------------------------------------
    */

    pdfUrl: {
      type: String,
      default: "",
    },

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

    /*
    |--------------------------------------------------------------------------
    | SOFT DELETE
    |--------------------------------------------------------------------------
    */

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| AUTO INVOICE NUMBER
|--------------------------------------------------------------------------
*/

invoiceSchema.pre("save", function (next) {
  if (!this.invoiceNumber) {
    this.invoiceNumber =
      "INV-" +
      Date.now() +
      "-" +
      Math.floor(Math.random() * 10000);
  }

  this.balance = this.totalAmount - this.amountPaid;

  if (this.balance <= 0) {
    this.status = "paid";
  } else if (this.amountPaid > 0) {
    this.status = "partial";
  }

  next();
});

/*
|--------------------------------------------------------------------------
| METHODS
|--------------------------------------------------------------------------
*/

invoiceSchema.methods.calculateBalance = function () {
  return this.totalAmount - this.amountPaid;
};

invoiceSchema.methods.markPaid = function (reference = "") {
  this.amountPaid = this.totalAmount;
  this.balance = 0;
  this.status = "paid";

  if (reference) {
    this.paymentReference = reference;
  }

  return this.save();
};

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

invoiceSchema.index({
  booking: 1,
});

invoiceSchema.index({
  customer: 1,
});

invoiceSchema.index({
  tour: 1,
});

invoiceSchema.index({
  invoiceNumber: 1,
});

invoiceSchema.index({
  status: 1,
});

invoiceSchema.index({
  createdAt: -1,
});

invoiceSchema.index({
  dueDate: 1,
});

invoiceSchema.index({
  isDeleted: 1,
});

/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/

const Invoice =
  mongoose.models.Invoice ||
  mongoose.model("Invoice", invoiceSchema);

export default Invoice;
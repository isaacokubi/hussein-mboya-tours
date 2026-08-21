// server/models/Quotation.js

import mongoose from "mongoose";
import tenantIsolationPlugin from "../utils/tenantIsolationPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| QUOTATION ITEM SCHEMA
|--------------------------------------------------------------------------
*/

const quotationItemSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index:true },
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Accommodation",
        "Transport",
        "Activity",
        "Meal",
        "Guide",
        "Park Fee",
        "Insurance",
        "Visa",
        "Other",
      ],
      default: "Other",
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| QUOTATION SCHEMA
|--------------------------------------------------------------------------
*/

const quotationSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | QUOTATION NUMBER
    |--------------------------------------------------------------------------
    */

    quotationNumber: {
      type: String,
      unique: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | AGENT
    |--------------------------------------------------------------------------
    */

    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      required: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER
    |--------------------------------------------------------------------------
    */

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | TOUR
    |--------------------------------------------------------------------------
    */

    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | TOUR PACKAGE
    |--------------------------------------------------------------------------
    */

    tourPackage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TourPackage",
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | ITEMS
    |--------------------------------------------------------------------------
    */

    items: {
      type: [quotationItemSchema],
      default: [],
    },

    /*
    |--------------------------------------------------------------------------
    | PRICING
    |--------------------------------------------------------------------------
    */

    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    grandTotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: "KES",
      uppercase: true,
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
        "sent",
        "approved",
        "rejected",
        "expired",
        "converted",
      ],
      default: "draft",
      index: true,
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
    | VALIDITY
    |--------------------------------------------------------------------------
    */

    validUntil: {
      type: Date,
      required: true,
    },

    sentAt: {
      type: Date,
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | CONVERTED BOOKING
    |--------------------------------------------------------------------------
    */

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | CREATED BY
    |--------------------------------------------------------------------------
    */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | SOFT DELETE
    |--------------------------------------------------------------------------
    */

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
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
| PRE SAVE
|--------------------------------------------------------------------------
*/

quotationSchema.pre("save", function (next) {
  if (!this.quotationNumber) {
    this.quotationNumber =
      "QT-" +
      Date.now() +
      "-" +
      Math.floor(Math.random() * 10000);
  }

  this.subtotal = this.items.reduce(
    (sum, item) => sum + item.total,
    0
  );

  this.grandTotal =
    this.subtotal +
    this.tax -
    this.discount;

  next();
});

/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/

quotationSchema.virtual("isExpired").get(function () {
  return new Date() > this.validUntil;
});

/*
|--------------------------------------------------------------------------
| METHODS
|--------------------------------------------------------------------------
*/

quotationSchema.methods.markSent = function () {
  this.status = "sent";
  this.sentAt = new Date();
  return this.save();
};

quotationSchema.methods.markApproved = function () {
  this.status = "approved";
  this.approvedAt = new Date();
  return this.save();
};

quotationSchema.methods.markConverted = function (bookingId) {
  this.status = "converted";
  this.booking = bookingId;
  return this.save();
};

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

quotationSchema.index({
  customer: 1,
  status: 1,
});

quotationSchema.index({
  agent: 1,
  createdAt: -1,
});

quotationSchema.index({
  validUntil: 1,
});

quotationSchema.index({
  createdAt: -1,
});

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

const Quotation =
  mongoose.models.Quotation ||
  mongoose.model("Quotation", quotationSchema);








quotationSchema.plugin(tenantIsolationPlugin);
export default Quotation;
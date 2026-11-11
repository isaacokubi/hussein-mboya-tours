/**
 * Purpose: Quotation database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/Quotation.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| QUOTATION ITEM SCHEMA
|--------------------------------------------------------------------------
*/

// Declare quotationItemSchema for use by the surrounding module or function.
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

// Declare quotationSchema for use by the surrounding module or function.
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

// Perform the side effect or state update expressed on the following line.
quotationSchema.pre("save", function (next) {
  // Check the condition (!this.quotationNumber) and run the matching branch.
  if (!this.quotationNumber) {
    // Perform the side effect or state update expressed on the following line.
    this.quotationNumber =
      "QT-" +
      Date.now() +
      "-" +
      Math.floor(Math.random() * 10000);
  }

  // Perform the side effect or state update expressed on the following line.
  this.subtotal = this.items.reduce(
    (sum, item) => sum + item.total,
    0
  );

  // Perform the side effect or state update expressed on the following line.
  this.grandTotal =
    this.subtotal +
    this.tax -
    this.discount;

  // Perform the side effect or state update expressed on the following line.
  next();
});

/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
quotationSchema.virtual("isExpired").get(function () {
  // Return the expression shown below to the caller.
  return new Date() > this.validUntil;
});

/*
|--------------------------------------------------------------------------
| METHODS
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
quotationSchema.methods.markSent = function () {
  // Perform the side effect or state update expressed on the following line.
  this.status = "sent";
  // Perform the side effect or state update expressed on the following line.
  this.sentAt = new Date();
  // Return the result of this.save() to the caller.
  return this.save();
};

// Perform the side effect or state update expressed on the following line.
quotationSchema.methods.markApproved = function () {
  // Perform the side effect or state update expressed on the following line.
  this.status = "approved";
  // Perform the side effect or state update expressed on the following line.
  this.approvedAt = new Date();
  // Return the result of this.save() to the caller.
  return this.save();
};

// Perform the side effect or state update expressed on the following line.
quotationSchema.methods.markConverted = function (bookingId) {
  // Perform the side effect or state update expressed on the following line.
  this.status = "converted";
  // Perform the side effect or state update expressed on the following line.
  this.booking = bookingId;
  // Return the result of this.save() to the caller.
  return this.save();
};

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
quotationSchema.index({
  customer: 1,
  status: 1,
});

// Perform the side effect or state update expressed on the following line.
quotationSchema.index({
  agent: 1,
  createdAt: -1,
});

// Perform the side effect or state update expressed on the following line.
quotationSchema.index({
  validUntil: 1,
});

// Perform the side effect or state update expressed on the following line.
quotationSchema.index({
  createdAt: -1,
});

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

// Declare tenantQuotationSchema for use by the surrounding module or function.
const tenantQuotationSchema = quotationSchema.plugin(tenantPlugin);
// Declare Quotation for use by the surrounding module or function.
const Quotation = mongoose.models.Quotation || mongoose.model("Quotation", tenantQuotationSchema);








export default Quotation;

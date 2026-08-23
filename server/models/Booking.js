import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| TRAVELER SCHEMA
|--------------------------------------------------------------------------
*/

const travelerSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index:true },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    age: {
      type: Number,
      min: 0,
      max: 120,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },

    passportNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    nationality: {
      type: String,
      trim: true,
      default: "",
    },

    dateOfBirth: Date,

    emergencyContactName: {
      type: String,
      trim: true,
      default: "",
    },

    emergencyContactPhone: {
      type: String,
      trim: true,
      default: "",
    },

    dietaryRequirements: {
      type: String,
      default: "",
    },

    medicalConditions: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  },
);

/*
|--------------------------------------------------------------------------
| CUSTOMER SNAPSHOT
|--------------------------------------------------------------------------
*/

const customerSnapshotSchema = new mongoose.Schema(
  {
    name: String,

    email: String,

    phone: String,
  },
  {
    _id: false,
  },
);

/*
|--------------------------------------------------------------------------
| EMERGENCY CONTACT
|--------------------------------------------------------------------------
*/

const emergencyContactSchema = new mongoose.Schema(
  {
    name: String,

    phone: String,

    relationship: String,
  },
  {
    _id: false,
  },
);

/*
|--------------------------------------------------------------------------
| BOOKING SCHEMA
|--------------------------------------------------------------------------
*/

const bookingSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | BOOKING NUMBER
    |--------------------------------------------------------------------------
    */

    bookingNumber: {
      type: String,
      unique: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER
    |--------------------------------------------------------------------------
    */


customTourRequest:{
type:mongoose.Schema.Types.ObjectId,
ref:"CustomTourRequest",
default:null
},

customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
      index: true,
    },

    // Website-authenticated customer account. Agent/walk-in bookings may
    // continue to use the Customer document above.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    customerSnapshot: customerSnapshotSchema,

    /*
|--------------------------------------------------------------------------
| CONTACT INFORMATION
|--------------------------------------------------------------------------
*/

    contact: {
      name: {
        type: String,
        trim: true,
        default: "",
      },

      email: {
        type: String,
        lowercase: true,
        trim: true,
        default: "",
      },

      phone: {
        type: String,
        trim: true,
        default: "",
      },
    },
    /*
    |--------------------------------------------------------------------------
    | AGENT
    |--------------------------------------------------------------------------
    */

    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      default: null,
    },

    bookingSource: {
      type: String,
      enum: [
        "website",
        "mobile_app",
        "agent",
        "admin",
        "walk_in",
        "partner",
        "api",
      ],
      default: "website",
    },

    /*
    |--------------------------------------------------------------------------
    | TOUR
    |--------------------------------------------------------------------------
    */

    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: false,
      default: null,
      index: true,
    },

    travelDate: {
      type: Date,
      required: true,
    },

    originalTravelDate: { type: Date, default: null },

    rescheduleHistory: [{
      fromDate: { type: Date },
      toDate: { type: Date },
      reason: { type: String, default: "" },
      requestedAt: { type: Date, default: Date.now },
    }],

    rescheduleCount: { type: Number, default: 0, min: 0 },

    travelers: {
      type: [travelerSchema],
      default: [],
    },

    numberOfGuests: {
      type: Number,
      default: 1,
      min: 1,
    },

    /*
    |--------------------------------------------------------------------------
    | PICKUP DETAILS
    |--------------------------------------------------------------------------
    */

    pickupLocation: {
      type: String,
      trim: true,
      default: "",
    },

    pickupTime: Date,

    hotelName: {
      type: String,
      trim: true,
      default: "",
    },

    roomNumber: {
      type: String,
      trim: true,
      default: "",
    },

    emergencyContact: emergencyContactSchema,

    specialRequests: [
      {
        type: String,
        trim: true,
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | TOUR ASSIGNMENTS
    |--------------------------------------------------------------------------
    */

    assignedGuide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
    },

    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
    },

    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null,
    },

    assigned: {
      type: Boolean,
      default: false,
    } /*
    |--------------------------------------------------------------------------
    | PRICING
    |--------------------------------------------------------------------------
    */,

    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    serviceFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    couponUsed: {
      type: String,
      trim: true,
      default: "",
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | AGENT COMMISSION
    |--------------------------------------------------------------------------
    */

    commissionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    commissionAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    commissionStatus: {
      type: String,
      enum: ["pending", "approved", "paid", "cancelled"],
      default: "pending",
    },

    commissionPaidAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | PAYMENT
    |--------------------------------------------------------------------------
    */

    depositAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    balanceAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["MPESA", "CARD", "PAYPAL", "BANK_TRANSFER", "CASH"],
      default: "MPESA",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid", "failed", "cancelled", "refunded"],
      default: "pending",
      index: true,
    },

    transactionId: {
      type: String,
      trim: true,
    },

    paymentReference: {
      type: String,
      trim: true,
    },

    mpesaReceipt: {
      type: String,
      trim: true,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | PAYMENT HISTORY
    |--------------------------------------------------------------------------
    */

    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | REFUND
    |--------------------------------------------------------------------------
    */

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundStatus: {
      type: String,
      enum: [
        "none",
        "requested",
        "approved",
        "processing",
        "completed",
        "rejected",
      ],
      default: "none",
    },

    refundReason: {
      type: String,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | BOOKING STATUS
    |--------------------------------------------------------------------------
    */

    status: {
      type: String,
      enum: [
        "pending",
        "failed",
        "confirmed",
        "assigned",
        "ongoing",
        "completed",
        "cancelled",
        "refunded",
      ],
      default: "pending",
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | BOOKING TIMELINE
    |--------------------------------------------------------------------------
    */

    confirmedAt: Date,

    assignedAt: Date,

    startedAt: Date,

    completedAt: Date,

    cancelledAt: Date,

    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    cancellationReason: {
      type: String,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | ABANDONED BOOKINGS
    |--------------------------------------------------------------------------
    */

    abandoned: {
      type: Boolean,
      default: false,
    },

    abandonedAt: Date,

    lastReminderSent: Date,

    /*
    |--------------------------------------------------------------------------
    | DOCUMENTS
    |--------------------------------------------------------------------------
    */

    documents: [
      {
        type: String,
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | NOTES
    |--------------------------------------------------------------------------
    */

    customerNotes: {
      type: String,
      default: "",
    },

    staffNotes: {
      type: String,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | AUDIT
    |--------------------------------------------------------------------------
    */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

    deletedAt: {
      type: Date,
      default: null,
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
  },
); /*
|--------------------------------------------------------------------------
| GENERATE BOOKING NUMBER
|--------------------------------------------------------------------------
*/

bookingSchema.pre("save", function (next) {
  if (!this.bookingNumber) {
    const year = new Date().getFullYear();

    const random = Math.random().toString(36).substring(2, 8).toUpperCase();

    this.bookingNumber = `HMT-${year}-${random}`;
  }

  next();
});

/*
|--------------------------------------------------------------------------
| CALCULATIONS & VALIDATION
|--------------------------------------------------------------------------
*/

bookingSchema.pre("save", function (next) {
  // Automatically determine guest count

  if (this.travelers?.length > 0) {
    this.numberOfGuests = this.travelers.length;
  }

  // Prevent invalid deposits

  if (this.depositAmount > this.totalAmount) {
    return next(new Error("Deposit amount cannot exceed total amount."));
  }

  // Calculate financial state from the total amount already paid.

  this.depositAmount = Math.min(
    Math.max(Number(this.depositAmount || 0), 0),
    Number(this.totalAmount || 0)
  );

  this.balanceAmount = Math.max(
    0,
    Number(this.totalAmount || 0) -
      Number(this.depositAmount || 0)
  );

  // Synchronize payment status with the actual financial state.

  if (
    Number(this.totalAmount || 0) > 0 &&
    Number(this.depositAmount || 0) >=
      Number(this.totalAmount || 0)
  ) {
    this.depositAmount =
      Number(this.totalAmount);

    this.balanceAmount = 0;

    this.paymentStatus = "paid";

  } else if (
    Number(this.depositAmount || 0) > 0
  ) {
    this.paymentStatus = "partial";
  }

  // Calculate commission

  if (this.agent && this.commissionRate > 0) {
    this.commissionAmount = (this.totalAmount * this.commissionRate) / 100;
  } else {
    this.commissionAmount = 0;
  }

  // Sync assignment flag

  this.assigned = Boolean(
    this.assignedGuide || this.assignedDriver || this.assignedVehicle,
  );

  // Automatic timestamps

  if (
    this.isModified("status") &&
    this.status === "confirmed" &&
    !this.confirmedAt
  ) {
    this.confirmedAt = new Date();
  }

  if (
    this.isModified("status") &&
    this.status === "assigned" &&
    !this.assignedAt
  ) {
    this.assignedAt = new Date();
  }

  if (
    this.isModified("status") &&
    this.status === "ongoing" &&
    !this.startedAt
  ) {
    this.startedAt = new Date();
  }

  if (
    this.isModified("status") &&
    this.status === "completed" &&
    !this.completedAt
  ) {
    this.completedAt = new Date();
  }

  if (
    this.isModified("status") &&
    this.status === "cancelled" &&
    !this.cancelledAt
  ) {
    this.cancelledAt = new Date();
  }

  next();
});

/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/

bookingSchema.virtual("remainingBalance").get(function () {
  return Math.max(0, this.totalAmount - this.depositAmount);
});

bookingSchema.virtual("isPaid").get(function () {
  return this.paymentStatus === "paid";
});

bookingSchema.virtual("isAssigned").get(function () {
  return Boolean(
    this.assignedGuide || this.assignedDriver || this.assignedVehicle,
  );
});

bookingSchema.virtual("isCompleted").get(function () {
  return this.status === "completed";
});

bookingSchema.virtual("isCancelled").get(function () {
  return this.status === "cancelled";
});

/*
|--------------------------------------------------------------------------
| INSTANCE METHODS
|--------------------------------------------------------------------------
*/

bookingSchema.methods.calculateCommission = function () {
  return (this.totalAmount * this.commissionRate) / 100;
};

bookingSchema.methods.calculateBalance = function () {
  return Math.max(0, this.totalAmount - this.depositAmount);
};

bookingSchema.methods.markPaid = function () {
  this.paymentStatus = "paid";

  this.depositAmount = this.totalAmount;

  this.balanceAmount = 0;

  return this.save();
};

bookingSchema.methods.markCompleted = function () {
  this.status = "completed";

  this.completedAt = new Date();

  return this.save();
};

bookingSchema.methods.cancelBooking = function (reason = "") {
  this.status = "cancelled";

  this.cancellationReason = reason;

  this.cancelledAt = new Date();

  return this.save();
};

/*
|--------------------------------------------------------------------------
| STATIC METHODS
|--------------------------------------------------------------------------
*/

bookingSchema.statics.findUpcoming = function () {
  return this.find({
    status: {
      $in: ["confirmed", "assigned", "ongoing"],
    },
    travelDate: {
      $gte: new Date(),
    },
    isDeleted: false,
  });
};

bookingSchema.statics.findCompleted = function () {
  return this.find({
    status: "completed",
    isDeleted: false,
  });
};

bookingSchema.statics.findPendingPayments = function () {
  return this.find({
    paymentStatus: {
      $in: ["pending", "partial"],
    },
    isDeleted: false,
  });
};

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

bookingSchema.index({
  customer: 1,
  createdAt: -1,
});

bookingSchema.index({
  agent: 1,
});

bookingSchema.index({
  travelDate: 1,
});



bookingSchema.index({
  paymentReference: 1,
});

bookingSchema.index({
  transactionId: 1,
});



bookingSchema.index({
  assignedGuide: 1,
});

bookingSchema.index({
  assignedDriver: 1,
});

bookingSchema.index({
  assignedVehicle: 1,
});

bookingSchema.index({
  createdAt: -1,
});

bookingSchema.index({
  isDeleted: 1,
});

bookingSchema.index({
  refundStatus: 1,
});

bookingSchema.index({
  commissionStatus: 1,
});

bookingSchema.index({
  customer: 1,
  travelDate: 1,
});

bookingSchema.index({
  tour: 1,
  travelDate: 1,
});


// Ensure every booking belongs to either a standard tour or a custom tour request
bookingSchema.pre("validate", function(next) {
  if (!this.tour && !this.customTourRequest) {
    return next(new Error("Booking must have either a tour or a custom tour request."));
  }

  next();
});

/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/

if (!mongoose.models.Booking) {
  bookingSchema.plugin(tenantPlugin);
}

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

export default Booking;

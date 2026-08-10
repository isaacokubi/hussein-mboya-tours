import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| COMMISSION SCHEMA
|--------------------------------------------------------------------------
*/

const commissionSchema = new mongoose.Schema(
  {
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
    | RELATED BOOKING
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
    },

    /*
    |--------------------------------------------------------------------------
    | TOUR
    |--------------------------------------------------------------------------
    */

    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
    },

    /*
    |--------------------------------------------------------------------------
    | SALES INFORMATION
    |--------------------------------------------------------------------------
    */

    bookingAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    rate: {
      type: Number,
      required: true,
      default: 10,
      min: 0,
      max: 100,
    },

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
        "approved",
        "processing",
        "paid",
        "cancelled",
        "rejected",
      ],
      default: "pending",
      
    },

    /*
    |--------------------------------------------------------------------------
    | PAYMENT DETAILS
    |--------------------------------------------------------------------------
    */

    paymentMethod: {
      type: String,
      enum: [
        "BANK_TRANSFER",
        "MPESA",
        "CASH",
        "CHEQUE",
      ],
    },

    paymentReference: {
      type: String,
      trim: true,
      default: "",
    },

    transactionId: {
      type: String,
      trim: true,
      default: "",
    },

    paidAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | APPROVAL
    |--------------------------------------------------------------------------
    */

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | REJECTION
    |--------------------------------------------------------------------------
    */

    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
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

    financeNotes: {
      type: String,
      default: "",
      trim: true,
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
  }
);

/*
|--------------------------------------------------------------------------
| PRE SAVE
|--------------------------------------------------------------------------
*/

commissionSchema.pre("save", function (next) {
  if (!this.amount && this.bookingAmount && this.rate) {
    this.amount = (this.bookingAmount * this.rate) / 100;
  }

  next();
});

/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/

commissionSchema.virtual("isPaid").get(function () {
  return this.status === "paid";
});

commissionSchema.virtual("isPending").get(function () {
  return this.status === "pending";
});

/*
|--------------------------------------------------------------------------
| INSTANCE METHODS
|--------------------------------------------------------------------------
*/

commissionSchema.methods.approve = function (adminId) {
  this.status = "approved";
  this.approvedBy = adminId;
  this.approvedAt = new Date();

  return this.save();
};

commissionSchema.methods.markPaid = function (
  reference,
  method
) {
  this.status = "paid";
  this.paymentReference = reference;
  this.paymentMethod = method;
  this.paidAt = new Date();

  return this.save();
};

commissionSchema.methods.reject = function (
  adminId,
  reason
) {
  this.status = "rejected";
  this.rejectedBy = adminId;
  this.rejectedAt = new Date();
  this.rejectionReason = reason;

  return this.save();
};

/*
|--------------------------------------------------------------------------
| STATIC METHODS
|--------------------------------------------------------------------------
*/

commissionSchema.statics.getPending = function () {
  return this.find({
    status: "pending",
    isDeleted: false,
  });
};

commissionSchema.statics.getPaid = function () {
  return this.find({
    status: "paid",
    isDeleted: false,
  });
};

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

commissionSchema.index({
  agent: 1,
  status: 1,
});



commissionSchema.index({
  paymentReference: 1,
});

commissionSchema.index({
  paidAt: -1,
});

commissionSchema.index({
  createdAt: -1,
});

commissionSchema.index({
  isDeleted: 1,
});

commissionSchema.index({
  approvedBy: 1,
});

commissionSchema.index({
  customer: 1,
});

commissionSchema.index({
  tour: 1,
});

/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/

const Commission =
  mongoose.models.Commission ||
  mongoose.model("Commission", commissionSchema);

export default Commission;
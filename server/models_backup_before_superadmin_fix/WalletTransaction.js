// server/models/WalletTransaction.js

import mongoose from "mongoose";
import tenantIsolationPlugin from "../utils/tenantIsolationPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| WALLET TRANSACTION SCHEMA
|--------------------------------------------------------------------------
|
| Records every wallet movement for travel agents.
|
| Examples:
| - Commission earned
| - Withdrawal
| - Refund adjustment
| - Bonus
| - Manual adjustment
|
|--------------------------------------------------------------------------
*/

const walletTransactionSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index:true },
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
    | RELATED USER (Backward Compatibility)
    |--------------------------------------------------------------------------
    */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | RELATED COMMISSION
    |--------------------------------------------------------------------------
    */

    commission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commission",
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | RELATED BOOKING
    |--------------------------------------------------------------------------
    */

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | TRANSACTION TYPE
    |--------------------------------------------------------------------------
    */

    type: {
      type: String,
      enum: [
        "commission",
        "withdrawal",
        "refund",
        "bonus",
        "adjustment",
      ],
      required: true,
    },

    /*
    |--------------------------------------------------------------------------
    | TRANSACTION DIRECTION
    |--------------------------------------------------------------------------
    */

    direction: {
      type: String,
      enum: ["credit", "debit"],
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
    | WALLET BALANCE
    |--------------------------------------------------------------------------
    */

    balanceBefore: {
      type: Number,
      default: 0,
      min: 0,
    },

    balanceAfter: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | REFERENCE
    |--------------------------------------------------------------------------
    */

    reference: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | PAYMENT DETAILS
    |--------------------------------------------------------------------------
    */

    paymentMethod: {
      type: String,
      enum: [
        "mpesa",
        "bank_transfer",
        "cash",
        "internal",
        "other",
      ],
      default: "internal",
    },

    transactionReference: {
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
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled",
      ],
      default: "completed",
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
    | NOTES
    |--------------------------------------------------------------------------
    */

    notes: {
      type: String,
      trim: true,
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

walletTransactionSchema.index({
  agent: 1,
  createdAt: -1,
});

walletTransactionSchema.index({
  booking: 1,
});

walletTransactionSchema.index({
  commission: 1,
});

walletTransactionSchema.index({
  status: 1,
});

walletTransactionSchema.index({
  type: 1,
});

/*
|--------------------------------------------------------------------------
| MODEL EXPORT
|--------------------------------------------------------------------------
*/

const WalletTransaction =
  mongoose.models.WalletTransaction ||
  mongoose.model(
    "WalletTransaction",
    walletTransactionSchema
  );








walletTransactionSchema.plugin(tenantIsolationPlugin);
export default WalletTransaction;

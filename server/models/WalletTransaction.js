/**
 * Purpose: Wallet Transaction database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/WalletTransaction.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
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

// Declare walletTransactionSchema for use by the surrounding module or function.
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

// Perform the side effect or state update expressed on the following line.
walletTransactionSchema.index({
  agent: 1,
  createdAt: -1,
});

// Perform the side effect or state update expressed on the following line.
walletTransactionSchema.index({
  booking: 1,
});

// Perform the side effect or state update expressed on the following line.
walletTransactionSchema.index({
  commission: 1,
});

// Perform the side effect or state update expressed on the following line.
walletTransactionSchema.index({
  status: 1,
});

// Perform the side effect or state update expressed on the following line.
walletTransactionSchema.index({
  type: 1,
});

/*
|--------------------------------------------------------------------------
| MODEL EXPORT
|--------------------------------------------------------------------------
*/

// Declare tenantWalletTransactionSchema for use by the surrounding module or function.
const tenantWalletTransactionSchema = walletTransactionSchema.plugin(tenantPlugin);
// Declare WalletTransaction for use by the surrounding module or function.
const WalletTransaction = mongoose.models.WalletTransaction || mongoose.model("WalletTransaction", tenantWalletTransactionSchema);








export default WalletTransaction;

/**
 * Purpose: auto Cancel Expired Pending Bookings operational script. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { backgroundTenantFilter } from "../tenancy/backgroundTenantFilter.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";

// Declare uri for use by the surrounding module or function.
const uri = process.env.MONGODB_URI;

// Check the condition (!uri) and run the matching branch.
if (!uri) {
  // Perform the side effect or state update expressed on the following line.
  console.error("MONGODB_URI is required.");
  // Perform the side effect or state update expressed on the following line.
  process.exit(1);
}

// Perform the side effect or state update expressed on the following line.
await mongoose.connect(uri);

// Declare cutoff for use by the surrounding module or function.
const cutoff =
  new Date(Date.now() - 30 * 60 * 1000);

// Perform the side effect or state update expressed on the following line.
console.log(
  "Cancelling unpaid pending bookings before:",
  cutoff
);

// Declare result for use by the surrounding module or function.
const result =
  await Booking.updateMany(
    {
      status: "pending",
      paymentStatus: "pending",
      createdAt: {
        $lt: cutoff
      }
    },
    {
      $set: {
        status: "cancelled",
        paymentStatus: "cancelled",
        cancellationReason:
          "Automatically cancelled after 30 minutes without payment."
      }
    }
  );

// Perform the side effect or state update expressed on the following line.
console.log({
  matched: result.matchedCount,
  modified: result.modifiedCount
});

// Perform the side effect or state update expressed on the following line.
await mongoose.disconnect();

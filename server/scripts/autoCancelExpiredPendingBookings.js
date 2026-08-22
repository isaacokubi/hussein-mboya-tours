import mongoose from "mongoose";
import Booking from "../models/Booking.js";

const uri =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI;

if (!uri) {
  console.log("Missing Mongo URI");
  process.exit(1);
}

await mongoose.connect(uri);

const cutoff =
  new Date(Date.now() - 30 * 60 * 1000);

console.log(
  "Cancelling unpaid pending bookings before:",
  cutoff
);

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

console.log({
  matched: result.matchedCount,
  modified: result.modifiedCount
});

await mongoose.disconnect();

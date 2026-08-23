import { backgroundTenantFilter } from "../tenancy/backgroundTenantFilter.js";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";

await mongoose.connect(
 process.env.MONGODB_URI ||
 process.env.MONGO_URI
);

const invalid =
await Booking.find({
 $or:[
  {
   status:"pending",
   paymentStatus:{
    $in:[
     "failed",
     "cancelled"
    ]
   }
  },
  {
   status:"cancelled",
   paymentStatus:"pending"
  }
 ]
})
.select(
"bookingNumber status paymentStatus"
)
.lean();

console.log("INVALID BOOKINGS:");
console.table(invalid);

console.log(
"COUNT:",
invalid.length
);

await mongoose.disconnect();

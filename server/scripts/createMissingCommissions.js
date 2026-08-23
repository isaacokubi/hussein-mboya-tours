import { backgroundTenantFilter } from "../tenancy/backgroundTenantFilter.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

import Booking from "../models/Booking.js";
import Agent from "../models/Agent.js";
import Commission from "../models/Commission.js";

dotenv.config();


await mongoose.connect(process.env.MONGODB_URI);


const bookings = await Booking.find({
 paymentStatus:"paid",
 agent:{
  $ne:null
 }
});


for(const booking of bookings){

const exists =
await Commission.findOne({
 booking:booking._id
});


if(exists){
 console.log(
 "Already exists",
 booking.bookingNumber
 );
 continue;
}


const agent =
await Agent.findById(
 booking.agent
);


if(!agent){
 console.log(
 "Agent missing"
 );
 continue;
}


const amount =
(
 Number(
 booking.totalAmount || booking.amount || 0
 )
 *
 Number(
 agent.commissionRate || 10
 )
)/100;


await Commission.create({

agent:agent._id,

booking:booking._id,

customer:booking.customer,

tour:booking.tour,

bookingAmount:
Number(
booking.totalAmount || booking.amount || 0
),

rate:
agent.commissionRate || 10,

amount,

status:"pending",

paymentMethod:
booking.paymentMethod || "MPESA"

});


console.log(
"Commission created:",
booking.bookingNumber,
amount
);

}


// debug removed

process.exit();

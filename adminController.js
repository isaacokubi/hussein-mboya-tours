import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Tour from "../models/Tour.js";


export const getDashboardStats =
async(req,res,next)=>{

try{


const users =
await User.countDocuments();



const tours =
await Tour.countDocuments();



const bookings =
await Booking.countDocuments();



const completedPayments =
await Payment.find({

status:"completed"

});



const revenue =
completedPayments.reduce(

(total,payment)=>
total + payment.amount,

0

);



const pendingPayments =
await Payment.countDocuments({

status:"pending"

});



res.json({

users,

tours,

bookings,

revenue,

pendingPayments

});


}
catch(error){

next(error);

}

};
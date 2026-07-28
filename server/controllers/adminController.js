// server/controllers/adminController.js


import User from "../models/User.js";

import Booking from "../models/Booking.js";

import Tour from "../models/Tour.js";

import Payment from "../models/Payment.js";




// ============================================================
// ADMIN DASHBOARD STATISTICS
// ============================================================

export const getDashboardStats = async (req,res)=>{


try{


const users = await User.countDocuments();


const bookings = await Booking.countDocuments();


const tours = await Tour.countDocuments();


let payments = 0;


if(Payment){

payments = await Payment.countDocuments();

}




res.status(200).json({

success:true,

data:{

users,

bookings,

tours,

payments

}

});


}
catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};









// ============================================================
// GET ALL USERS
// ============================================================

export const getUsers = async(req,res)=>{


try{


const users = await User.find()

.select("-password")

.sort({

createdAt:-1

});




res.status(200).json({

success:true,

data:users

});


}
catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};









// ============================================================
// GET ALL BOOKINGS
// ============================================================

export const getBookings = async(req,res)=>{


try{


const bookings = await Booking.find()


.populate(

"customer",

"name email phone"

)


.populate(

"tour",

"title"

)


.sort({

createdAt:-1

});





res.status(200).json({

success:true,

data:bookings

});


}
catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};
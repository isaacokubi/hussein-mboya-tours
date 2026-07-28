import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";



// ============================================================
// ADMIN DASHBOARD STATS
// ============================================================

export const dashboardStats = async (req,res)=>{

try{


const users = await User.countDocuments();

const bookings = await Booking.countDocuments();

const tours = await Tour.countDocuments();


res.json({

success:true,

data:{
    users,
    bookings,
    tours
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


const users =
await User.find()
.select("-password")
.sort({
createdAt:-1
});


res.json({

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


const bookings =
await Booking.find()

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



res.json({

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
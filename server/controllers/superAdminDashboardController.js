import User from "../models/User.js";
import Staff from "../models/Staff.js";
import Agent from "../models/Agent.js";
import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";

export const getSuperAdminDashboard = async (req,res)=>{

try{

console.log("SUPERADMIN DB:", process.env.MONGODB_URI?.split("/").pop());

const [
users,
staff,
agents,
vehicles,
bookings,
admins
]=await Promise.all([

User.countDocuments(),

Staff.countDocuments(),

Agent.countDocuments(),

Vehicle.countDocuments(),

Booking.countDocuments(),

User.countDocuments({
role:{
$in:[
"admin",
"superadmin",
"super_admin"
]
}
})

]);


res.json({

success:true,

data:{
stats:{
users,
staff,
agents,
vehicles,
bookings,
admins
}
},

timestamp:new Date()

});


}catch(error){

console.error("SuperAdmin dashboard error:",error);

res.status(500).json({

success:false,
message:error.message

});

}

};

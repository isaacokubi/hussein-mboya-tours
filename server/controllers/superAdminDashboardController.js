import User from "../models/User.js";
import Staff from "../models/Staff.js";
import Agent from "../models/Agent.js";
import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";

export const getSuperAdminDashboard = async (req,res)=>{

try{

// debug removed.pop());

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


res.status(200).json({

success:true,

stats:{
users:Number(users)||0,
staff:Number(staff)||0,
agents:Number(agents)||0,
vehicles:Number(vehicles)||0,
bookings:Number(bookings)||0,
admins:Number(admins)||0
},

timestamp:new Date().toISOString()

});


}catch(error){

console.error("SuperAdmin dashboard error:",error);

res.status(500).json({

success:false,
message:error.message

});

}

};

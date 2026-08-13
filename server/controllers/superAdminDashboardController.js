
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";


export const getSuperAdminDashboard=async(req,res)=>{

try{

const [
users,
staff,
agents,
vehicles,
bookings,
admins
]=await Promise.all([

User.countDocuments(),

User.countDocuments({
role:{
$in:[
"manager",
"tour_manager",
"tourmanager",
"guide",
"tour_guide",
"driver"
]
}
}),

User.countDocuments({
role:{
$in:[
"agent"
]
}
}),

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
stats:{
users,
staff,
agents,
vehicles,
bookings,
admins
}
});


}catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

};

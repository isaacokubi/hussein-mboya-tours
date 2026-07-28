// server/controllers/guideController.js


import Tour from "../models/Tour.js";

import Booking from "../models/Booking.js";

import TourReport from "../models/TourReport.js";

import Staff from "../models/Staff.js";







/*
|--------------------------------------------------------------------------
| GUIDE DASHBOARD
|--------------------------------------------------------------------------
|
| Shows tours assigned to logged-in guide
|
|--------------------------------------------------------------------------
*/


export const guideDashboard = async(req,res)=>{


try{


const guide = await Staff.findOne({

email:req.user.email

});



if(!guide){


return res.status(404).json({

success:false,

message:"Guide profile not found"

});


}





const tours = await Tour.find({

assignedGuide:guide._id

})


.populate(
"destination"
)


.populate(
"assignedVehicle"
)


.populate(
"assignedDriver"
)


.sort({

startDate:1

});







res.status(200).json({

success:true,

count:tours.length,

tours

});



}


catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};









/*
|--------------------------------------------------------------------------
| GET ASSIGNED TOURS FOR GUIDE
|--------------------------------------------------------------------------
|
| Used by guide portal
|
|--------------------------------------------------------------------------
*/


export const getAssignedTours = async(req,res)=>{


try{


const guideId = req.user._id;



const tours = await Tour.find({

assignedGuide:guideId

})


.populate(
"destination"
)


.populate(
"assignedVehicle"
)


.populate(
"assignedDriver"
)


.sort({

createdAt:-1

});





res.status(200).json({

success:true,

data:tours

});



}


catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};











/*
|--------------------------------------------------------------------------
| GET TOUR DETAILS
|--------------------------------------------------------------------------
*/


export const getTourDetails = async(req,res)=>{


try{


const guide = await Staff.findOne({

email:req.user.email

});





const tour = await Tour.findOne({

_id:req.params.id,

assignedGuide:guide._id

})


.populate(
"destination"
)


.populate(
"assignedVehicle"
)


.populate(
"assignedDriver"
);






if(!tour){


return res.status(404).json({

success:false,

message:"Tour not found"

});


}






res.status(200).json({

success:true,

tour

});



}


catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};











/*
|--------------------------------------------------------------------------
| GET TOUR GUESTS
|--------------------------------------------------------------------------
|
| Guide views customers travelling on assigned tour
|
|--------------------------------------------------------------------------
*/


export const getTourGuests = async(req,res)=>{


try{


const bookings = await Booking.find({

tour:req.params.id,

status:"confirmed"

})


.populate(

"customer",

"name email phone"

)


.populate(

"user",

"name email phone"

);







res.status(200).json({

success:true,

count:bookings.length,

guests:bookings

});



}


catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};









/*
|--------------------------------------------------------------------------
| UPDATE TOUR STATUS
|--------------------------------------------------------------------------
|
| Guide updates:
|
| scheduled
| ongoing
| completed
| cancelled
|
|--------------------------------------------------------------------------
*/


export const updateTourStatus = async(req,res)=>{


try{


const {

status

}=req.body;





const guide = await Staff.findOne({

email:req.user.email

});





const tour = await Tour.findOneAndUpdate(

{

_id:req.params.id,

assignedGuide:guide._id

},

{

tourStatus:status

},

{

new:true

}

);







if(!tour){


return res.status(404).json({

success:false,

message:"Tour not found or not assigned to guide"

});


}







res.status(200).json({

success:true,

message:"Tour status updated",

tour

});



}


catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};









/*
|--------------------------------------------------------------------------
| SUBMIT TOUR REPORT
|--------------------------------------------------------------------------
|
| Guide completes tour and submits report
|
|--------------------------------------------------------------------------
*/


export const submitTourReport = async(req,res)=>{


try{


const report = await TourReport.create({

tour:req.params.id,

guide:req.user.id,

summary:req.body.summary,

issues:req.body.issues || [],

photos:req.body.photos || []

});







await Tour.findByIdAndUpdate(

req.params.id,

{

tourStatus:"completed"

}

);







res.status(201).json({

success:true,

message:"Tour report submitted successfully",

report

});



}


catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};
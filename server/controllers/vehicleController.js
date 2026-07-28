import Tour from "../models/Tour.js";

import Vehicle from "../models/Vehicle.js";

import Staff from "../models/Staff.js";





/*
|--------------------------------------------------------------------------
| ASSIGN TOUR RESOURCES
|--------------------------------------------------------------------------
|
| Assign:
| - Guide
| - Driver
| - Vehicle
| - Staff
|
| Automatically update availability
|
|--------------------------------------------------------------------------
*/


export const assignTourResources = async(req,res)=>{


try{


const {

guideId,

driverId,

vehicleId,

staffIds,

startDate,

endDate


}=req.body;







const tour = await Tour.findById(

req.params.id

);







if(!tour)

{


return res.status(404).json({

success:false,

message:"Tour not found"

});


}









/*
|--------------------------------------------------------------------------
| ASSIGN TOUR RESOURCES
|--------------------------------------------------------------------------
*/


tour.guide = guideId || tour.guide;


tour.driver = driverId || tour.driver;


tour.vehicle = vehicleId || tour.vehicle;



tour.staff = staffIds || tour.staff;



tour.startDate = startDate || tour.startDate;


tour.endDate = endDate || tour.endDate;









/*
|--------------------------------------------------------------------------
| UPDATE VEHICLE STATUS AUTOMATICALLY
|--------------------------------------------------------------------------
*/


if(vehicleId)

{


await Vehicle.findByIdAndUpdate(

vehicleId,

{


status:"Assigned"


},

{


new:true

}

);


}









/*
|--------------------------------------------------------------------------
| UPDATE DRIVER AVAILABILITY
|--------------------------------------------------------------------------
*/


if(driverId)

{


await Staff.findByIdAndUpdate(

driverId,

{


availability:"busy"


},

{


new:true

}

);


}









/*
|--------------------------------------------------------------------------
| UPDATE GUIDE AVAILABILITY
|--------------------------------------------------------------------------
*/


if(guideId)

{


await Staff.findByIdAndUpdate(

guideId,

{


availability:"busy"


},

{


new:true

}

);


}









/*
|--------------------------------------------------------------------------
| UPDATE OTHER STAFF AVAILABILITY
|--------------------------------------------------------------------------
*/


if(

staffIds && staffIds.length > 0

)

{


await Staff.updateMany(

{


_id:{

$in:staffIds

}

},


{


availability:"busy"

}


);


}









await tour.save();









/*
|--------------------------------------------------------------------------
| POPULATE RESPONSE
|--------------------------------------------------------------------------
*/


const updatedTour = await Tour.findById(

tour._id

)

.populate(

"guide",

"name phone email"

)

.populate(

"driver",

"name phone email"

)

.populate(

"vehicle",

"name registrationNumber status"

)

.populate(

"staff",

"name phone email role"

);







res.status(200).json({

success:true,

message:

"Tour resources assigned successfully",

tour:updatedTour

});



}

catch(error)

{


res.status(500).json({

success:false,

message:error.message

});


}



};
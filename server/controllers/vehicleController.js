// server/controllers/vehicleController.js


import Vehicle from "../models/Vehicle.js";

import Tour from "../models/Tour.js";

import Staff from "../models/Staff.js";




// ============================================================
// CREATE VEHICLE
// ============================================================

export const createVehicle = async(req,res)=>{


try{


const vehicle = await Vehicle.create({

...req.body,

image:req.file ? req.file.path : ""

});



res.status(201).json({

success:true,

message:"Vehicle created successfully",

vehicle

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
// GET ALL VEHICLES
// ============================================================

export const getVehicles = async(req,res)=>{


try{


const vehicles = await Vehicle.find({

isDeleted:false

})

.populate(

"assignedDriver",

"name phone email"

)

.sort({

createdAt:-1

});





res.status(200).json({

success:true,

count:vehicles.length,

vehicles

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
// GET SINGLE VEHICLE
// ============================================================

export const getVehicle = async(req,res)=>{


try{


const vehicle = await Vehicle.findById(

req.params.id

)

.populate(

"assignedDriver",

"name phone email"

);





if(!vehicle){


return res.status(404).json({

success:false,

message:"Vehicle not found"

});


}





res.status(200).json({

success:true,

vehicle

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
// UPDATE VEHICLE
// ============================================================

export const updateVehicle = async(req,res)=>{


try{


const updateData = {


...req.body

};



if(req.file){


updateData.image = req.file.path;


}



const vehicle = await Vehicle.findByIdAndUpdate(

req.params.id,

updateData,

{

new:true,

runValidators:true

}

);





if(!vehicle){


return res.status(404).json({

success:false,

message:"Vehicle not found"

});


}





res.status(200).json({

success:true,

message:"Vehicle updated successfully",

vehicle

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
// DELETE VEHICLE (SOFT DELETE)
// ============================================================

export const deleteVehicle = async(req,res)=>{


try{


const vehicle = await Vehicle.findByIdAndUpdate(

req.params.id,

{

isDeleted:true,

status:"Inactive"

},

{

new:true

}

);





if(!vehicle){


return res.status(404).json({

success:false,

message:"Vehicle not found"

});


}





res.status(200).json({

success:true,

message:"Vehicle deleted successfully",

vehicle

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
// RESTORE VEHICLE
// ============================================================

export const restoreVehicle = async(req,res)=>{


try{


const vehicle = await Vehicle.findByIdAndUpdate(

req.params.id,

{

isDeleted:false,

status:"Available"

},

{

new:true

}

);





if(!vehicle){


return res.status(404).json({

success:false,

message:"Vehicle not found"

});


}





res.status(200).json({

success:true,

message:"Vehicle restored successfully",

vehicle

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
// ASSIGN DRIVER TO VEHICLE
// ============================================================

export const assignVehicleDriver = async(req,res)=>{


try{


const {

driver

}=req.body;





const vehicle = await Vehicle.findByIdAndUpdate(

req.params.id,

{

assignedDriver:driver || null

},

{

new:true

}

);





if(!vehicle){


return res.status(404).json({

success:false,

message:"Vehicle not found"

});


}





if(driver){


await Staff.findByIdAndUpdate(

driver,

{

availability:"busy"

}

);


}





res.status(200).json({

success:true,

message:"Driver assigned successfully",

vehicle

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
// REMOVE DRIVER FROM VEHICLE
// ============================================================

export const removeVehicleDriver = async(req,res)=>{


try{


const vehicle = await Vehicle.findByIdAndUpdate(

req.params.id,

{

assignedDriver:null

},

{

new:true

}

);





if(!vehicle){


return res.status(404).json({

success:false,

message:"Vehicle not found"

});


}





res.status(200).json({

success:true,

message:"Driver removed successfully",

vehicle

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
// ASSIGN TOUR RESOURCES
// ============================================================

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





if(!tour){


return res.status(404).json({

success:false,

message:"Tour not found"

});


}





tour.guide = guideId || tour.guide;


tour.driver = driverId || tour.driver;


tour.vehicle = vehicleId || tour.vehicle;


tour.staff = staffIds || tour.staff;


tour.startDate = startDate || tour.startDate;


tour.endDate = endDate || tour.endDate;









if(vehicleId){


await Vehicle.findByIdAndUpdate(

vehicleId,

{

status:"Assigned"

}

);


}









if(driverId){


await Staff.findByIdAndUpdate(

driverId,

{

availability:"busy"

}

);


}









if(guideId){


await Staff.findByIdAndUpdate(

guideId,

{

availability:"busy"

}

);


}









if(staffIds && staffIds.length){


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









const updatedTour = await Tour.findById(

tour._id

)

.populate(

"guide"

)

.populate(

"driver"

)

.populate(

"vehicle"

)

.populate(

"staff"

);







res.status(200).json({

success:true,

message:"Tour resources assigned successfully",

tour:updatedTour

});


}
catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};
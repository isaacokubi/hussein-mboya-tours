import Tour from "../models/Tour.js";





/*
|--------------------------------------------------------------------------
| CREATE TOUR
|--------------------------------------------------------------------------
*/

export const createTour = async(req,res,next)=>{

try{


let images=[];


if(req.files?.length){

images =
req.files.map(
file=>({

url:file.path,

publicId:file.filename || null

})
);

}



const tour = await Tour.create({

...req.body,

images,

createdBy:req.user._id

});



res.status(201).json({

success:true,

message:"Tour created successfully",

tour

});


}
catch(error){

next(error);

}

};








/*
|--------------------------------------------------------------------------
| GET ALL TOURS (ADMIN)
|--------------------------------------------------------------------------
*/


export const getAllTours = async(req,res,next)=>{


try{


const tours = await Tour.find({

isDeleted:false

})

.populate(
"assignedGuide",
"name email phone"
)

.populate(
"assignedDriver",
"name email phone"
)

.populate(
"assignedVehicle"
)

.populate(
"createdBy",
"name email"
)

.sort({

createdAt:-1

});



res.json({

success:true,

count:tours.length,

tours

});



}
catch(error){

next(error);

}

};








/*
|--------------------------------------------------------------------------
| GET SINGLE TOUR
|--------------------------------------------------------------------------
*/


export const getTour = async(req,res,next)=>{


try{


const tour = await Tour.findOne({

_id:req.params.id,

isDeleted:false

})

.populate(
"assignedGuide",
"name email"
)

.populate(
"assignedDriver",
"name email"
)

.populate(
"assignedVehicle"
);



if(!tour){

return res.status(404).json({

message:"Tour not found"

});

}



res.json({

success:true,

tour

});


}
catch(error){

next(error);

}

};








/*
|--------------------------------------------------------------------------
| UPDATE TOUR
|--------------------------------------------------------------------------
*/


export const updateTour = async(req,res,next)=>{


try{


const tour =
await Tour.findById(
req.params.id
);



if(!tour){

return res.status(404).json({

message:"Tour not found"

});

}



Object.assign(

tour,

req.body

);





if(req.files?.length){


tour.images =
req.files.map(
file=>({

url:file.path,

publicId:file.filename || null

})
);


}





await tour.save();





res.json({

success:true,

message:"Tour updated successfully",

tour

});



}
catch(error){

next(error);

}

};









/*
|--------------------------------------------------------------------------
| SOFT DELETE TOUR
|--------------------------------------------------------------------------
*/


export const deleteTour = async(req,res,next)=>{


try{


const tour =
await Tour.findById(
req.params.id
);



if(!tour){

return res.status(404).json({

message:"Tour not found"

});

}



tour.isDeleted=true;


await tour.save();




res.json({

success:true,

message:"Tour deleted successfully"

});



}
catch(error){

next(error);

}

};









/*
|--------------------------------------------------------------------------
| ASSIGN GUIDE
|--------------------------------------------------------------------------
*/


export const assignGuide = async(req,res,next)=>{


try{


const {
guideId
}=req.body;



const tour =
await Tour.findByIdAndUpdate(

req.params.id,

{

assignedGuide:guideId,

guide:guideId

},

{
new:true
}

);



res.json({

success:true,

message:"Guide assigned successfully",

tour

});


}
catch(error){

next(error);

}

};









/*
|--------------------------------------------------------------------------
| ASSIGN DRIVER
|--------------------------------------------------------------------------
*/


export const assignDriver = async(req,res,next)=>{


try{


const {
driverId
}=req.body;



const tour =
await Tour.findByIdAndUpdate(

req.params.id,

{

assignedDriver:driverId

},

{
new:true
}

);



res.json({

success:true,

message:"Driver assigned successfully",

tour

});


}
catch(error){

next(error);

}

};









/*
|--------------------------------------------------------------------------
| ASSIGN VEHICLE
|--------------------------------------------------------------------------
*/


export const assignVehicle = async(req,res,next)=>{


try{


const {
vehicleId
}=req.body;



const tour =
await Tour.findByIdAndUpdate(

req.params.id,

{

assignedVehicle:vehicleId,

vehicle:vehicleId

},

{
new:true
}

);



res.json({

success:true,

message:"Vehicle assigned successfully",

tour

});


}
catch(error){

next(error);

}

};









/*
|--------------------------------------------------------------------------
| RESTORE DELETED TOUR
|--------------------------------------------------------------------------
*/


export const restoreTour = async(req,res,next)=>{


try{


const tour =
await Tour.findByIdAndUpdate(

req.params.id,

{

isDeleted:false

},

{
new:true
}

);



res.json({

success:true,

message:"Tour restored successfully",

tour

});


}
catch(error){

next(error);

}

};
import Vehicle from "../models/Vehicle.js";





/*
|--------------------------------------------------------------------------
| CREATE VEHICLE
|--------------------------------------------------------------------------
*/

export const createVehicle = async(
req,
res
)=>{


try{


const vehicle =

await Vehicle.create(

req.body

);





res.status(201).json({

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









/*
|--------------------------------------------------------------------------
| GET VEHICLES
|--------------------------------------------------------------------------
*/

export const getVehicles = async(
req,
res
)=>{


try{


const vehicles =

await Vehicle.find({

status:{
$in:[
"Available",
"Assigned"
]
}

})

.sort({

createdAt:-1

});







res.status(200).json({

success:true,

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









/*
|--------------------------------------------------------------------------
| UPDATE VEHICLE
|--------------------------------------------------------------------------
*/

export const updateVehicle = async(
req,
res
)=>{


try{


const vehicle =

await Vehicle.findByIdAndUpdate(

req.params.id,

req.body,

{

new:true,

runValidators:true

}

);






if(!vehicle){


return res.status(404).json({

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
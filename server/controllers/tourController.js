import Tour from "../models/Tour.js";
import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";





/*
|--------------------------------------------------------------------------
| CREATE TOUR
|--------------------------------------------------------------------------
*/

export const createTour = async (
    req,
    res,
    next
) => {


    try {


        const tour =
        await Tour.create({

            ...req.body,

            createdBy:req.user._id

        });



        res.status(201).json({

            success:true,

            message:
            "Tour created successfully",

            tour

        });


    }

    catch(error){

        next(error);

    }


};









/*
|--------------------------------------------------------------------------
| GET ALL TOURS
|--------------------------------------------------------------------------
*/

export const getTours = async(
req,
res,
next
)=>{


try{


const tours =
await Tour.find()

.populate(
    "guide",
    "name email"
)

.populate(
    "vehicle"
)

.populate(
    "createdBy",
    "name email"
)

.sort({

    createdAt:-1

});





res.status(200).json({

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
| GET TOUR MANAGER TOURS
|--------------------------------------------------------------------------
*/

export const getManagerTours = async(
req,
res,
next
)=>{


try{


const tours =
await Tour.find({

    createdBy:req.user._id

})

.populate(
    "guide",
    "name email"
)

.populate(
    "vehicle"
)

.sort({

    createdAt:-1

});





res.status(200).json({

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

export const getTourById = async(
req,
res,
next
)=>{


try{


const tour =
await Tour.findById(
    req.params.id
)

.populate(
    "guide",
    "name email"
)

.populate(
    "vehicle"
)

.populate(
    "createdBy",
    "name email"
);







if(!tour){


return res.status(404).json({

    success:false,

    message:
    "Tour not found"

});


}







res.status(200).json({

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

export const updateTour = async(
req,
res,
next
)=>{


try{


const tour =
await Tour.findByIdAndUpdate(

    req.params.id,

    {

        ...req.body

    },

    {

        new:true,

        runValidators:true

    }

);







if(!tour){


return res.status(404).json({

    success:false,

    message:
    "Tour not found"

});


}







res.status(200).json({

    success:true,

    message:
    "Tour updated successfully",

    tour

});


}


catch(error){

next(error);

}


};









/*
|--------------------------------------------------------------------------
| DELETE TOUR
|--------------------------------------------------------------------------
*/

export const deleteTour = async(
req,
res,
next
)=>{


try{


const tour =
await Tour.findByIdAndDelete(
    req.params.id
);







if(!tour){


return res.status(404).json({

    success:false,

    message:
    "Tour not found"

});


}







res.status(200).json({

    success:true,

    message:
    "Tour deleted successfully"

});


}


catch(error){

next(error);

}


};









/*
|--------------------------------------------------------------------------
| ASSIGN GUIDE TO TOUR
|--------------------------------------------------------------------------
*/

export const assignGuide = async(
req,
res
)=>{


try{


const {

guideId

}

=
req.body;







if(!guideId){


return res.status(400).json({

    success:false,

    message:
    "Guide ID is required"

});


}







const tour =
await Tour.findById(
    req.params.id
);







if(!tour){


return res.status(404).json({

    success:false,

    message:
    "Tour not found"

});


}







tour.guide =
guideId;



await tour.save();







const updatedTour =
await Tour.findById(
    tour._id
)

.populate(
    "guide",
    "name email"
);







res.status(200).json({

    success:true,

    message:
    "Guide assigned successfully",

    tour:updatedTour

});


}


catch(error){


res.status(500).json({

    success:false,

    message:
    error.message

});


}


};









/*
|--------------------------------------------------------------------------
| ASSIGN VEHICLE TO TOUR
|--------------------------------------------------------------------------
*/

export const assignVehicle = async(
req,
res
)=>{


try{


const {

vehicleId

}

=
req.body;







if(!vehicleId){


return res.status(400).json({

    success:false,

    message:
    "Vehicle ID is required"

});


}







const vehicle =
await Vehicle.findById(
    vehicleId
);







if(!vehicle){


return res.status(404).json({

    success:false,

    message:
    "Vehicle not found"

});


}







if(vehicle.status === "Assigned"){


return res.status(400).json({

    success:false,

    message:
    "Vehicle is already assigned"

});


}







const tour =
await Tour.findById(
    req.params.id
);







if(!tour){


return res.status(404).json({

    success:false,

    message:
    "Tour not found"

});


}







tour.vehicle =
vehicleId;



await tour.save();







vehicle.status =
"Assigned";



await vehicle.save();







const updatedTour =
await Tour.findById(
    tour._id
)

.populate(
    "vehicle"
);







res.status(200).json({

    success:true,

    message:
    "Vehicle assigned successfully",

    tour:updatedTour

});


}


catch(error){


res.status(500).json({

    success:false,

    message:
    error.message

});


}


};









/*
|--------------------------------------------------------------------------
| REMOVE VEHICLE FROM TOUR
|--------------------------------------------------------------------------
*/

export const removeVehicle = async(
req,
res
)=>{


try{


const tour =
await Tour.findById(
    req.params.id
);







if(!tour){


return res.status(404).json({

    success:false,

    message:
    "Tour not found"

});


}







if(tour.vehicle){


const vehicle =
await Vehicle.findById(
    tour.vehicle
);



if(vehicle){


vehicle.status =
"Available";


await vehicle.save();


}


}







tour.vehicle =
null;


await tour.save();







res.status(200).json({

    success:true,

    message:
    "Vehicle removed successfully"

});


}


catch(error){


res.status(500).json({

    success:false,

    message:
    error.message

});


}


};









/*
|--------------------------------------------------------------------------
| TOUR MANAGER REPORTS
|--------------------------------------------------------------------------
*/

export const getReports = async(
req,
res
)=>{


try{


const totalTours =

await Tour.countDocuments({

createdBy:req.user._id

});





const completedTours =

await Tour.countDocuments({

createdBy:req.user._id,

status:"completed"

});






const upcomingTours =

await Tour.countDocuments({

createdBy:req.user._id,

status:"upcoming"

});









const tours =

await Tour.find({

createdBy:req.user._id

})

.populate(
"vehicle"
)

.populate(
"guide",
"name email"
)

.sort({

createdAt:-1

});









const tourIds =

tours.map(

tour=>tour._id

);








const totalBookings =

await Booking.countDocuments({

tour:{
$in:tourIds
}

});








const revenue =

await Booking.aggregate([


{

$match:{


tour:{
$in:tourIds
},


paymentStatus:"paid"


}

},


{

$group:{


_id:null,


totalRevenue:{

$sum:"$totalAmount"

}


}

}


]);








const totalRevenue =

revenue[0]?.totalRevenue || 0;








res.status(200).json({

success:true,


reports:{


totalTours,

completedTours,

upcomingTours,

totalBookings,

totalRevenue,

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
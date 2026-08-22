import { mergeTenantFilter } from "../tenancy/context.js";
import Tour from "../models/Tour.js";
import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";
import Staff from "../models/Staff.js";
import { getSystemSettings } from "../services/settingsService.js";



/*
|--------------------------------------------------------------------------
| PUBLIC TOUR FILTER
|--------------------------------------------------------------------------
*/

const publicTourFilter = {

  available:true,

  isDeleted:false,

  published:true,

  status:{
    $in:[
      "scheduled",
      "upcoming",
      "ongoing"
    ]
  }

};

const attachAvailability = (tourLike) => {
  const totalSlots = Number(
    tourLike?.availabilitySettings?.totalSlots ??
    tourLike?.capacity ??
    0
  );
  const bookedSlots = Math.max(
    0,
    Number(tourLike?.availabilitySettings?.bookedSlots ?? 0)
  );
  const availableSlots = Math.max(totalSlots - bookedSlots, 0);

  return {
    ...tourLike,
    totalSlots,
    bookedSlots,
    availableSlots,
    isFull: availableSlots === 0,
  };
};





/*
|--------------------------------------------------------------------------
| GET ALL PUBLIC TOURS
|--------------------------------------------------------------------------
*/

export const getTours = async(req,res,next)=>{

  try{

    const {

      page=1,

      limit=12,

      search,

      destination,

      category,

      featured


    } = req.query;




    const filter={

      ...publicTourFilter

    };




    if(destination){

      filter.destination =
        destination;

    }



    if(category){

      filter.category =
        category;

    }



    if(featured==="true"){

      filter.featured=true;

    }






    if(search){

      filter.$or=[

        {
          title:{
            $regex:search,
            $options:"i"
          }
        },

        {
          description:{
            $regex:search,
            $options:"i"
          }
        },

        {
          location:{
            $regex:search,
            $options:"i"
          }
        }

      ];

    }






    const skip =
      (Number(page)-1)
      *
      Number(limit);




    const [
      tours,
      total
    ] =
    await Promise.all([


      Tour.find(filter)

      .populate("destination")

      .populate(
        "assignedGuide",
        "name"
      )

      .populate(
        "assignedVehicle"
      )

      .sort({
        createdAt:-1
      })

      .skip(skip)

      .limit(
        Number(limit)
      ),




      Tour.countDocuments(
        filter
      )



    ]);





    const settings = await getSystemSettings();

    const formattedTours = tours.map((tour) => ({
      ...attachAvailability(tour.toObject?.() || tour),
      currency: settings.currency || "KES",
      currencySymbol: settings.currencySymbol || "KSh"
    }));


    return res.json({

      success:true,


      pagination:{

        total,

        page:Number(page),

        pages:
        Math.ceil(
          total /
          Number(limit)
        )

      },


      data:formattedTours

    });



  }catch(error){

    next(error);

  }

};








/*
|--------------------------------------------------------------------------
| FEATURED TOURS
|--------------------------------------------------------------------------
*/

export const getFeaturedTours =
async(req,res,next)=>{

try{


const tours =
await Tour.find({

  ...publicTourFilter,

  featured:true

})

.populate("destination")

.limit(6)

.sort({
 createdAt:-1
});



return res.json({

success:true,

data:tours

});


}catch(error){

next(error);

}

};








/*
|--------------------------------------------------------------------------
| SEARCH TOURS
|--------------------------------------------------------------------------
*/

export const searchTours =
async(req,res,next)=>{

try{


const {

keyword,

category,

country,

destination


}=req.query;




const filter={

...publicTourFilter

};




if(keyword){

filter.$or=[

{

title:{
$regex:keyword,
$options:"i"
}

},


{

description:{
$regex:keyword,
$options:"i"
}

}


];

}




if(category)
filter.category=category;



if(country)
filter.country=country;



if(destination)
filter.destination=destination;





const tours =
await Tour.find(filter)

.populate("destination")

.sort({
createdAt:-1
});





return res.json({

success:true,

count:tours.length,

data:tours

});



}catch(error){

next(error);

}

};








/*
|--------------------------------------------------------------------------
| GET SINGLE TOUR
|--------------------------------------------------------------------------
*/

export const getTourById =
async(req,res,next)=>{


try{


const tour =
await Tour.findById(
req.params.id
)

.populate("destination")

.populate("assignedGuide")

.populate("assignedDriver")

.populate("assignedVehicle");





if(!tour){

return res.status(404).json({

success:false,

message:"Tour not found"

});

}



return res.json({

success:true,

data:tour

});



}catch(error){

next(error);

}


};









/*
|--------------------------------------------------------------------------
| GET TOUR BY SLUG
|--------------------------------------------------------------------------
*/

export const getTourBySlug =
async(req,res,next)=>{

try{


const tour =
  await Tour.findOne({
    slug:req.params.slug,
    $or:[
        {
          available:true,
          isDeleted:false,
          published:true,
          status:{
            $in:[
              "scheduled",
              "upcoming",
              "ongoing"
            ]
          }
        },
        {
          slug:"custom-tour-package"
        }
      ]
  })
  .populate("destination");





if(!tour){

return res.status(404).json({

success:false,

message:"Tour not found"

});

}





return res.json({

success:true,

data:tour

});



}catch(error){

next(error);

}

};









/*
|--------------------------------------------------------------------------
| CREATE TOUR
|--------------------------------------------------------------------------
*/

export const createTour = async (req, res, next) => {
  try {
    const {
      title,
      description,
      destination,
      country,
      location,
      date,
      price,
      capacity,
      duration,
      difficulty,
      discount,
      status,
      published,
      guide,
      assignedGuide,
      driver,
      assignedDriver,
      vehicle,
      assignedVehicle,
      ...rest
    } = req.body || {};

    if (
      !title?.trim() ||
      !description?.trim() ||
      !destination ||
      !country?.trim() ||
      !location?.trim() ||
      !date ||
      price === undefined ||
      price === null ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, destination, country, location, date and a valid price are required.",
      });
    }

    const guideId = assignedGuide || guide || null;
    const driverId = assignedDriver || driver || null;
    const vehicleId = assignedVehicle || vehicle || null;

    const [guideDoc, driverDoc, vehicleDoc] = await Promise.all([
      guideId
        ? Staff.findOne({
            _id: guideId,
            position: "guide",
            isActive: true,
            isDeleted: { $ne: true },
          })
        : null,
      driverId
        ? Staff.findOne({
            _id: driverId,
            position: "driver",
            isActive: true,
            isDeleted: { $ne: true },
          })
        : null,
      vehicleId
        ? Vehicle.findOne({
            _id: vehicleId,
            isActive: true,
            isDeleted: { $ne: true },
          })
        : null,
    ]);

    if (guideId && (!guideDoc || guideDoc.availability !== "available")) {
      return res.status(400).json({
        success: false,
        message: "Selected guide is unavailable.",
      });
    }

    if (driverId && (!driverDoc || driverDoc.availability !== "available")) {
      return res.status(400).json({
        success: false,
        message: "Selected driver is unavailable.",
      });
    }

    if (vehicleId && (!vehicleDoc || vehicleDoc.status !== "available")) {
      return res.status(400).json({
        success: false,
        message: "Selected vehicle is unavailable.",
      });
    }

    const numericCapacity = Number(capacity) || 20;
    const numericDuration = Number(duration) || 1;
    const numericPrice = Number(price);
    const numericDiscount = Number(discount) || 0;

    if (numericCapacity < 1 || numericDuration < 1 || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Capacity, duration and price must contain valid values.",
      });
    }

    if (numericDiscount < 0 || numericDiscount > 100) {
      return res.status(400).json({
        success: false,
        message: "Discount must be between 0 and 100.",
      });
    }

    const uploadedImages = Array.isArray(req.files)
      ? req.files
          .filter((file) => file?.path)
          .map((file) => ({
            url: file.path,
            publicId: file.filename || file.public_id || "",
          }))
      : [];

    const tour = await Tour.create({
      ...rest,
      ...(uploadedImages.length
        ? {
            featuredImage: uploadedImages[0],
            gallery: uploadedImages,
          }
        : {}),
      title: title.trim(),
      description: description.trim(),
      destination,
      country: country.trim(),
      location: location.trim(),
      date,
      price: numericPrice,
      capacity: numericCapacity,
      duration: String(duration ?? numericDuration),
      durationDetails: {
        days: numericDuration,
        nights: 0,
      },
      difficulty: difficulty || "easy",
      discount: numericDiscount,
      assignedGuide: guideDoc?._id || null,
      assignedDriver: driverDoc?._id || null,
      assignedVehicle: vehicleDoc?._id || null,
      assignmentStatus:
        guideDoc || driverDoc || vehicleDoc ? "assigned" : "pending",
      status: status || "upcoming",
      published: published ?? true,
      available: true,
      availabilitySettings: {
        totalSlots: numericCapacity,
        bookedSlots: 0,
        waitlistEnabled: false,
      },
      createdBy: req.user._id,
    });

    // Keep staff/vehicle availability synchronized with the tour assignment.
    if (guideDoc) {
      await Staff.findByIdAndUpdate(guideDoc._id, {
        $set: { availability: "busy" },
        $addToSet: { assignedTours: tour._id },
      });
    }

    if (driverDoc) {
      await Staff.findByIdAndUpdate(driverDoc._id, {
        $set: { availability: "busy" },
        $addToSet: { assignedTours: tour._id },
      });
    }

    if (vehicleDoc) {
      await Vehicle.findByIdAndUpdate(vehicleDoc._id, {
        $set: {
          status: "assigned",
          assignedTour: tour._id,
        },
      });
    }

    const createdTour = await Tour.findById(tour._id)
      .populate("destination")
      .populate("assignedGuide", "name email phone position availability")
      .populate("assignedDriver", "name email phone position availability")
      .populate(
        "assignedVehicle",
        "name registrationNumber registration model type capacity status"
      )
      .lean();

    return res.status(201).json({
      success: true,
      message: "Tour created successfully",
      data: createdTour,
      tour: createdTour,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| MANAGER TOURS
|--------------------------------------------------------------------------
*/

export const getManagerTours =
async(req,res,next)=>{

try{


const tours =
await Tour.find({

createdBy:req.user._id,

isDeleted:false

})

.populate("destination")

.sort({
createdAt:-1
});



return res.json({

success:true,

count:tours.length,

data:tours

});



}catch(error){

next(error);

}

};








/*
|--------------------------------------------------------------------------
| UPDATE TOUR
|--------------------------------------------------------------------------
*/

export const updateTour =
async(req,res,next)=>{

try{


const updatePayload = { ...(req.body || {}) };
    if (Array.isArray(req.files) && req.files.length) {
      const uploadedImages = req.files.filter((file) => file?.path).map((file) => ({
        url: file.path,
        publicId: file.filename || file.public_id || "",
      }));
      updatePayload.featuredImage = uploadedImages[0];
      updatePayload.gallery = uploadedImages;
    }

const tour =
await Tour.findOneAndUpdate(
mergeTenantFilter(req,{
_id:req.params.id
}),
updatePayload,
{
new:true,
runValidators:true
}
);





if(!tour){

return res.status(404).json({

success:false,

message:"Tour not found"

});

}





return res.json({

success:true,

message:
"Tour updated successfully",

data:tour

});




}catch(error){

next(error);

}

};









/*
|--------------------------------------------------------------------------
| DELETE TOUR
|--------------------------------------------------------------------------
*/

export const deleteTour =
async(req,res,next)=>{


try{


const tour =
await Tour.findOneAndUpdate(
mergeTenantFilter(req,{
_id:req.params.id
}),

{

isDeleted:true,

available:false,

status:"cancelled"

},

{

new:true

}

);





if(!tour){

return res.status(404).json({

success:false,

message:"Tour not found"

});

}




return res.json({

success:true,

message:
"Tour deleted successfully"

});




}catch(error){

next(error);

}


};









/*
|--------------------------------------------------------------------------
| ASSIGN VEHICLE
|--------------------------------------------------------------------------
*/

export const assignVehicle =
async(req,res,next)=>{


try{


const vehicle =
await Vehicle.findById(
req.body.vehicleId
);



if(
!vehicle ||
!vehicle.isActive
){

return res.status(404).json({

success:false,

message:"Vehicle not found"

});

}





const tour =
await Tour.findById(
req.params.id
);



if(!tour){

return res.status(404).json({

success:false,

message:"Tour not found"

});

}





tour.assignedVehicle =
vehicle._id;


await tour.save();



vehicle.availability =
"assigned";


vehicle.assignedTour =
tour._id;



await vehicle.save();





return res.json({

success:true,

message:
"Vehicle assigned successfully",

data:tour

});



}catch(error){

next(error);

}

};









/*
|--------------------------------------------------------------------------
| REMOVE VEHICLE
|--------------------------------------------------------------------------
*/

export const removeVehicle =
async(req,res,next)=>{


try{


const tour =
await Tour.findById(
req.params.id
);



if(!tour){

return res.status(404).json({

success:false,

message:"Tour not found"

});

}



tour.assignedVehicle=null;


await tour.save();




return res.json({

success:true,

message:
"Vehicle removed successfully"

});



}catch(error){

next(error);

}


};








/*
|--------------------------------------------------------------------------
| REPORTS
|--------------------------------------------------------------------------
*/

export const getReports =
async(req,res,next)=>{


try{


const tours =
await Tour.find({

createdBy:req.user._id

});



const ids =
tours.map(
tour=>tour._id
);



const [
totalBookings,
revenue
]=
await Promise.all([


Booking.countDocuments({

tour:{
$in:ids
}

}),



Booking.aggregate([

{

$match:{

tour:{
$in:ids
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


])


]);





return res.json({

success:true,

data:{

totalTours:tours.length,

totalBookings,

totalRevenue:
revenue[0]?.totalRevenue || 0,

tours

}

});



}catch(error){

next(error);

}


};
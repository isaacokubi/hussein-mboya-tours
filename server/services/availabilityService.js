import Tour from "../models/Tour.js";



export const checkAvailability =
async(
tourId,
numberOfTravelers
)=>{


const tour =
await Tour.findById(
tourId
);



if(!tour){

throw new Error(
"Tour not found"
);

}



const remaining =

tour.availabilitySettings.totalSlots -

tour.availabilitySettings.bookedSlots;



return remaining >= numberOfTravelers;


};
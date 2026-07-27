import Tour from "../models/Tour.js";


export const reserveSlots =
async(
tourId,
count
)=>{


await Tour.findByIdAndUpdate(

tourId,

{

$inc:{

"availabilitySettings.bookedSlots":

count

}

}

);


};
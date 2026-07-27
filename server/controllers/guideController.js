import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";





/*
|--------------------------------------------------------------------------
| GET ASSIGNED TOURS
|--------------------------------------------------------------------------
*/


export const getAssignedTours = async(req,res)=>{


try{


const tours = await Tour.find({

guide:req.user._id

})
.populate(
"destination"
);



res.json(tours);



}catch(error){

res.status(500)
.json({

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


const tour =
await Tour.findOne({

_id:req.params.id,

guide:req.user._id

})
.populate(
"destination"
);



if(!tour){

return res.status(404)
.json({

message:
"Tour not found"

});


}



res.json(tour);



}catch(error){

res.status(500)
.json({

message:error.message

});


}



};









/*
|--------------------------------------------------------------------------
| GET TOUR GUESTS
|--------------------------------------------------------------------------
*/


export const getTourGuests = async(req,res)=>{


try{


const bookings =
await Booking.find({

tour:req.params.id

})
.populate(
"user",
"name email phone"
);



res.json(bookings);



}catch(error){


res.status(500)
.json({

message:error.message

});


}


};









/*
|--------------------------------------------------------------------------
| UPDATE TOUR STATUS
|--------------------------------------------------------------------------
*/


export const updateTourStatus = async(req,res)=>{


try{


const {

status

}=req.body;




const tour =
await Tour.findOneAndUpdate(

{

_id:req.params.id,

guide:req.user._id

},


{

status

},


{
new:true
}


);



res.json(tour);



}catch(error){


res.status(500)
.json({

message:error.message

});


}



};









/*
|--------------------------------------------------------------------------
| SUBMIT TOUR REPORT
|--------------------------------------------------------------------------
*/


export const submitTourReport = async(req,res)=>{


try{


const {

notes,

photos

}=req.body;



const tour =
await Tour.findOneAndUpdate(

{

_id:req.params.id,

guide:req.user._id

},


{

tourReport:{

notes,

photos,

submittedAt:
new Date()

}

},


{
new:true
}


);



res.json({

message:
"Tour report submitted successfully",

tour

});



}catch(error){


res.status(500)
.json({

message:error.message

});


}



};
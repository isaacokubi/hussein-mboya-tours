import Review from "../models/Review.js";
import Tour from "../models/Tour.js";



export const createReview =
async(req,res,next)=>{


try{


const {

tourId,
rating,
title,
comment

}
=
req.body;



const review =
await Review.create({

user:req.user._id,

tour:tourId,

rating,

title,

comment,

verified:true,

approved:false

});



res.status(201)
.json(review);


}
catch(error){

next(error);

}

};





export const getTourReviews =
async(req,res,next)=>{

try{


const reviews =
await Review.find({

tour:req.params.tourId,

approved:true

})
.populate(
"user",
"name avatar"
)
.sort({
createdAt:-1
});



res.json(reviews);


}
catch(error){

next(error);

}

};
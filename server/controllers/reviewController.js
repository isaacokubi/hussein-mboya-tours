import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";





/*
|--------------------------------------------------------------------------
| CREATE REVIEW
|--------------------------------------------------------------------------
*/


export const createReview = async (
  req,
  res,
  next
) => {

  try {


    const {

      tour,

      rating,

      title,

      comment

    } = req.body;





    /*
    |--------------------------------------------------------------------------
    | VERIFY CUSTOMER COMPLETED TOUR
    |--------------------------------------------------------------------------
    */


    const booking =
      await Booking.findOne({

        user:req.user._id,

        tour,

        bookingStatus:"completed"

      });





    if(!booking){

      return res
      .status(400)
      .json({

        message:
        "Only completed trips can be reviewed"

      });

    }








    /*
    |--------------------------------------------------------------------------
    | PREVENT DUPLICATE REVIEWS
    |--------------------------------------------------------------------------
    */


    const existingReview =
      await Review.findOne({

        user:req.user._id,

        tour

      });




    if(existingReview){

      return res
      .status(400)
      .json({

        message:
        "You already reviewed this tour"

      });

    }









    /*
    |--------------------------------------------------------------------------
    | CREATE REVIEW
    |--------------------------------------------------------------------------
    */


    const review =
      await Review.create({

        user:req.user._id,

        tour,

        booking:booking._id,

        rating,

        title,

        comment,


        verified:true,


        approved:false

      });








    res
    .status(201)
    .json(review);



  }

  catch(error){

    next(error);

  }

};









/*
|--------------------------------------------------------------------------
| PUBLIC GET TOUR REVIEWS
|--------------------------------------------------------------------------
*/


export const getTourReviews =
async(
req,
res,
next
)=>{


try{


const reviews =

await Review.find({

tour:req.params.id,

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









/*
|--------------------------------------------------------------------------
| ADMIN APPROVE REVIEW
|--------------------------------------------------------------------------
*/


export const approveReview =
async(
req,
res,
next
)=>{


try{


const review =
await Review.findById(
req.params.id
);



if(!review){

return res
.status(404)
.json({

message:
"Review not found"

});

}





review.approved =
true;



await review.save();







/*
|--------------------------------------------------------------------------
| UPDATE TOUR RATING
|--------------------------------------------------------------------------
*/


const reviews =
await Review.find({

tour:review.tour,

approved:true

});




const totalRating =

reviews.reduce(

(sum,item)=>

sum + item.rating,

0

);




const averageRating =

reviews.length

?

totalRating / reviews.length

:

0;







await Tour.findByIdAndUpdate(

review.tour,

{

averageRating:


Number(
averageRating.toFixed(1)
),



reviewsCount:

reviews.length,


totalReviews:

reviews.length,


rating:

Number(
averageRating.toFixed(1)
)

}

);






res.json({

success:true,

message:
"Review approved",

review

});



}

catch(error){

next(error);

}


};









/*
|--------------------------------------------------------------------------
| HELPFUL REVIEW VOTE
|--------------------------------------------------------------------------
*/


export const voteHelpful =
async(
req,
res,
next
)=>{


try{


const review =

await Review.findById(

req.params.id

);




if(!review){

return res
.status(404)
.json({

message:
"Review not found"

});

}




review.helpfulVotes =

(review.helpfulVotes || 0)
+
1;




await review.save();





res.json(review);



}

catch(error){

next(error);

}


};









/*
|--------------------------------------------------------------------------
| DELETE REVIEW (ADMIN)
|--------------------------------------------------------------------------
*/


export const deleteReview =
async(
req,
res,
next
)=>{


try{


const review =

await Review.findById(

req.params.id

);




if(!review){

return res
.status(404)
.json({

message:
"Review not found"

});

}




await review.deleteOne();





res.json({

success:true,

message:
"Review deleted"

});



}

catch(error){

next(error);

}


};
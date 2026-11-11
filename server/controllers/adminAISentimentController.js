/**
 * Purpose: admin AISentiment Controller HTTP controller. Main declarations: getAISentimentAnalysis.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load ../models/Review.js so this module can use its exported dependencies.
import Review from "../models/Review.js";


// Declare getAISentimentAnalysis for use by the surrounding module or function.
export const getAISentimentAnalysis = async(
req,
res,
next
)=>{
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();

// Run this operation with a dedicated error-handling path for failures.
try{


// Declare reviews for use by the surrounding module or function.
const reviews =
await Review.find(tenantFilter(req))
.sort({
createdAt:-1
})
.limit(100)
.lean();



// Declare positive for use by the surrounding module or function.
let positive = 0;
// Declare neutral for use by the surrounding module or function.
let neutral = 0;
// Declare negative for use by the surrounding module or function.
let negative = 0;


// Declare complaints for use by the surrounding module or function.
const complaints=[];


// Perform the side effect or state update expressed on the following line.
reviews.forEach(review=>{


// Declare rating for use by the surrounding module or function.
const rating =
Number(review.rating || 0);


// Check the condition (rating >= 4) and run the matching branch.
if(rating >= 4){

// Perform the side effect or state update expressed on the following line.
positive++;

}
else if(rating === 3){

// Perform the side effect or state update expressed on the following line.
neutral++;

}
else{

// Perform the side effect or state update expressed on the following line.
negative++;


// Perform the side effect or state update expressed on the following line.
complaints.push({

customer:
review.user?.name ||
"Customer",

comment:
review.comment ||
review.review ||
"No comment"

});

}


});



// Declare recommendations for use by the surrounding module or function.
const recommendations=[];



// Check the condition (negative > 0) and run the matching branch.
if(negative > 0){

// Perform the side effect or state update expressed on the following line.
recommendations.push(
`Follow up with ${negative} unhappy customer(s).`
);

}


// Check the condition (neutral > positive) and run the matching branch.
if(neutral > positive){

// Perform the side effect or state update expressed on the following line.
recommendations.push(
"Improve customer experience because neutral feedback is increasing."
);

}


// Check the condition (positive > negative) and run the matching branch.
if(positive > negative){

// Perform the side effect or state update expressed on the following line.
recommendations.push(
"Maintain current service quality."
);

}



// Check the condition (!recommendations.length) and run the matching branch.
if(!recommendations.length){

// Perform the side effect or state update expressed on the following line.
recommendations.push(
"No major sentiment issues detected."
);

}



// Perform the side effect or state update expressed on the following line.
res.json({

success:true,

data:{

metrics:{

totalReviews:
reviews.length,

positive,

neutral,

negative

},


complaints:
complaints.slice(0,10),


recommendations

}

});


}catch(error){

// Perform the side effect or state update expressed on the following line.
next(error);

}

};

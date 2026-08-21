import {mergeTenantFilter} from "../tenancy/secureQuery.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import Review from "../models/Review.js";


export const getAISentimentAnalysis = async(
req,
res,
next
)=>{

try{


const reviews =
await Review.find(tenantFilter(req))
.sort({
createdAt:-1
})
.limit(100)
.lean();



let positive = 0;
let neutral = 0;
let negative = 0;


const complaints=[];


reviews.forEach(review=>{


const rating =
Number(review.rating || 0);


if(rating >= 4){

positive++;

}
else if(rating === 3){

neutral++;

}
else{

negative++;


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



const recommendations=[];



if(negative > 0){

recommendations.push(
`Follow up with ${negative} unhappy customer(s).`
);

}


if(neutral > positive){

recommendations.push(
"Improve customer experience because neutral feedback is increasing."
);

}


if(positive > negative){

recommendations.push(
"Maintain current service quality."
);

}



if(!recommendations.length){

recommendations.push(
"No major sentiment issues detected."
);

}



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

next(error);

}

};

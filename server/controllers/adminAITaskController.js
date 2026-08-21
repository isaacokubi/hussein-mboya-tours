import { tenantFilter } from "../tenancy/tenantQuery.js";
import AITask from "../models/AITask.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Review from "../models/Review.js";



export const generateAITasks = async(
req,
res,
next
)=>{


try{


const tasks=[];



const pendingBookings =
await Booking.countDocuments({
status:"pending"
});



if(pendingBookings > 0){

tasks.push({

title:"Follow up pending bookings",

description:
`${pendingBookings} pending bookings require customer follow-up.`,

priority:"high",

category:"booking"

});

}



const pendingPayments =
await Payment.countDocuments({

status:{
$in:[
"pending",
"failed"
]

}

});



if(pendingPayments > 0){

tasks.push({

title:"Review payment issues",

description:
`${pendingPayments} payment records need attention.`,

priority:"medium",

category:"finance"

});

}



const poorReviews =
await Review.countDocuments({

rating:{
$lte:2
}

});



if(poorReviews > 0){

tasks.push({

title:"Handle negative customer feedback",

description:
`${poorReviews} customers left low ratings.`,

priority:"high",

category:"customer"

});

}



for(const task of tasks){

await AITask.findOneAndUpdate(

{
title:task.title
},

task,

{
upsert:true,
new:true
}

);

}



const saved =
await AITask.find(tenantFilter(req))
.sort({
createdAt:-1
})
.limit(20);



res.json({

success:true,

data:saved

});


}catch(error){

next(error);

}

};




export const updateAITask = async(
req,
res,
next
)=>{

try{


const task =
await AITask.findByIdAndUpdate(

req.params.id,

{
status:req.body.status
},

{
new:true
}

);



res.json({

success:true,

data:task

});


}catch(error){

next(error);

}

};

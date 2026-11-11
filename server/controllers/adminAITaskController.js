/**
 * Purpose: admin AITask Controller HTTP controller. Main declarations: generateAITasks, updateAITask.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load ../models/AITask.js so this module can use its exported dependencies.
import AITask from "../models/AITask.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/Review.js so this module can use its exported dependencies.
import Review from "../models/Review.js";



// Declare generateAITasks for use by the surrounding module or function.
export const generateAITasks = async(
req,
res,
next
)=>{
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();


// Run this operation with a dedicated error-handling path for failures.
try{


// Declare tasks for use by the surrounding module or function.
const tasks=[];



// Declare pendingBookings for use by the surrounding module or function.
const pendingBookings =
await Booking.countDocuments({
status:"pending"
});



// Check the condition (pendingBookings > 0) and run the matching branch.
if(pendingBookings > 0){

// Perform the side effect or state update expressed on the following line.
tasks.push({

title:"Follow up pending bookings",

description:
`${pendingBookings} pending bookings require customer follow-up.`,

priority:"high",

category:"booking"

});

}



// Declare pendingPayments for use by the surrounding module or function.
const pendingPayments =
await Payment.countDocuments({

status:{
$in:[
"pending",
"failed"
]

}

});



// Check the condition (pendingPayments > 0) and run the matching branch.
if(pendingPayments > 0){

// Perform the side effect or state update expressed on the following line.
tasks.push({

title:"Review payment issues",

description:
`${pendingPayments} payment records need attention.`,

priority:"medium",

category:"finance"

});

}



// Declare poorReviews for use by the surrounding module or function.
const poorReviews =
await Review.countDocuments({

rating:{
$lte:2
}

});



// Check the condition (poorReviews > 0) and run the matching branch.
if(poorReviews > 0){

// Perform the side effect or state update expressed on the following line.
tasks.push({

title:"Handle negative customer feedback",

description:
`${poorReviews} customers left low ratings.`,

priority:"high",

category:"customer"

});

}



// Repeat the enclosed work for each required iteration.
for(const task of tasks){

// Perform the side effect or state update expressed on the following line.
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



// Declare saved for use by the surrounding module or function.
const saved =
await AITask.find(tenantFilter(req))
.sort({
createdAt:-1
})
.limit(20);



// Perform the side effect or state update expressed on the following line.
res.json({

success:true,

data:saved

});


}catch(error){

// Perform the side effect or state update expressed on the following line.
next(error);

}

};




// Declare updateAITask for use by the surrounding module or function.
export const updateAITask = async(
req,
res,
next
)=>{

// Run this operation with a dedicated error-handling path for failures.
try{


// Declare task for use by the surrounding module or function.
const task =
await AITask.findOneAndUpdate(
mergeTenantFilter(req,{
_id:req.params.id
}),

{
status:req.body.status
},

{
new:true
}

);



// Perform the side effect or state update expressed on the following line.
res.json({

success:true,

data:task

});


}catch(error){

// Perform the side effect or state update expressed on the following line.
next(error);

}

};

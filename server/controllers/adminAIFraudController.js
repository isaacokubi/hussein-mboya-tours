/**
 * Purpose: admin AIFraud Controller HTTP controller. Main declarations: getAIFraudMonitoring.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";


// Declare getAIFraudMonitoring for use by the surrounding module or function.
export const getAIFraudMonitoring = async(
req,
res,
next
)=>{
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();

// Run this operation with a dedicated error-handling path for failures.
try{


// Declare [ failedPayments, pendingPayments, largePayments, duplicatePayments ] for use by the surrounding module or function.
const [

failedPayments,

pendingPayments,

largePayments,

duplicatePayments

] = await Promise.all([


Payment.countDocuments({

status:{
$in:[
"failed",
"cancelled"
]

}

}),



Payment.countDocuments({

status:"pending"

}),



Payment.countDocuments({

amount:{
$gte:100000
}

}),



Payment.aggregate([

{
$group:{
_id:"$transactionId",
count:{
$sum:1
}
}
},

{
$match:{
count:{
$gt:1
}
}
}

])


]);



// Declare alerts for use by the surrounding module or function.
const alerts=[];



// Check the condition (failedPayments > 0) and run the matching branch.
if(failedPayments > 0){

// Perform the side effect or state update expressed on the following line.
alerts.push({

level:"medium",

title:"Failed payment attempts",

message:
`${failedPayments} failed payment transactions detected.`

});

}



// Check the condition (pendingPayments > 5) and run the matching branch.
if(pendingPayments > 5){

// Perform the side effect or state update expressed on the following line.
alerts.push({

level:"medium",

title:"Payment backlog",

message:
`${pendingPayments} payments are still pending verification.`

});

}



// Check the condition (largePayments > 0) and run the matching branch.
if(largePayments > 0){

// Perform the side effect or state update expressed on the following line.
alerts.push({

level:"high",

title:"Large transaction review",

message:
`${largePayments} high-value payments require verification.`

});

}



// Check the condition (duplicatePayments.length > 0) and run the matching branch.
if(duplicatePayments.length > 0){

// Perform the side effect or state update expressed on the following line.
alerts.push({

level:"high",

title:"Possible duplicate payments",

message:
`${duplicatePayments.length} duplicate transaction patterns detected.`

});

}



// Check the condition (alerts.length===0) and run the matching branch.
if(alerts.length===0){

// Perform the side effect or state update expressed on the following line.
alerts.push({

level:"low",

title:"Payment security status",

message:
"No suspicious payment activity detected."

});

}



// Perform the side effect or state update expressed on the following line.
res.json({

success:true,

data:{

metrics:{

failedPayments,

pendingPayments,

largePayments,

duplicatePayments:
duplicatePayments.length

},

alerts

}

});


}catch(error){

// Perform the side effect or state update expressed on the following line.
next(error);

}

};

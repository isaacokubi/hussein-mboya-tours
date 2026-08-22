import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";


export const getAIFraudMonitoring = async(
req,
res,
next
)=>{

try{


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



const alerts=[];



if(failedPayments > 0){

alerts.push({

level:"medium",

title:"Failed payment attempts",

message:
`${failedPayments} failed payment transactions detected.`

});

}



if(pendingPayments > 5){

alerts.push({

level:"medium",

title:"Payment backlog",

message:
`${pendingPayments} payments are still pending verification.`

});

}



if(largePayments > 0){

alerts.push({

level:"high",

title:"Large transaction review",

message:
`${largePayments} high-value payments require verification.`

});

}



if(duplicatePayments.length > 0){

alerts.push({

level:"high",

title:"Possible duplicate payments",

message:
`${duplicatePayments.length} duplicate transaction patterns detected.`

});

}



if(alerts.length===0){

alerts.push({

level:"low",

title:"Payment security status",

message:
"No suspicious payment activity detected."

});

}



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

next(error);

}

};

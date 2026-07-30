import Payment from "../models/Payment.js";



export const getPaymentStatistics =
async()=>{


const result =
await Payment.aggregate([


{

$group:{

_id:"$method",


count:{

$sum:1

},


amount:{

$sum:"$amount"

}

}

}


]);


return result;


};
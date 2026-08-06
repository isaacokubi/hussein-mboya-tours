
import Payment from "../models/Payment.js";
import RefundAudit from "../models/RefundAudit.js";


export const getReconciliation = async(req,res,next)=>{

try{


const payments =
await Payment.aggregate([

{
$group:{
_id:"$status",
count:{
$sum:1
},
amount:{
$sum:"$amount"
}
}
}

]);



const refunds =
await RefundAudit.aggregate([

{
$group:{
_id:"$status",
count:{
$sum:1
},
amount:{
$sum:"$amount"
}
}

}

]);



res.json({

success:true,

data:{
payments,
refunds
}

});


}catch(error){

next(error);

}

};

import Coupon from "../models/Coupon.js";


export const applyCoupon =
async(
code,
amount
)=>{


const coupon =
await Coupon.findOne({

code,

active:true

});



if(!coupon){

return 0;

}



let discount=0;



if(
coupon.discountType==="percentage"
){

discount =
amount *
(
coupon.amount /100
);

}
else{


discount =
coupon.amount;


}



return discount;


};
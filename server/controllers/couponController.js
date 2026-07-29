import {
applyCoupon
}
from "../services/couponService.js";



export const validateCoupon =
async(req,res)=>{


const {

code,

amount

}

=req.body;



const discount =
await applyCoupon(
code,
amount
);



res.json({

discount

});


};
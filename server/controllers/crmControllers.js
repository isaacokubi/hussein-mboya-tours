import CustomerProfile
from "../models/CustomerProfile.js";



export const getCRMStats =
async(req,res)=>{


const totalCustomers =
await CustomerProfile.countDocuments();



const vipCustomers =
await CustomerProfile.countDocuments({

customerType:"vip"

});



const corporateCustomers =
await CustomerProfile.countDocuments({

customerType:"corporate"

});



res.json({

totalCustomers,

vipCustomers,

corporateCustomers

});


};
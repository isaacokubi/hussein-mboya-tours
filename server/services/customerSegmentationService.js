import CustomerProfile
from "../models/CustomerProfile.js";



export const updateCustomerSegment =
async(userId)=>{


const customer =
await CustomerProfile.findOne({

user:userId

});



if(!customer)
return;



if(
customer.totalSpent >=500000
){

customer.customerType =
"vip";

}

else if(
customer.totalBookings >=5
){

customer.customerType =
"regular";

}

else{

customer.customerType =
"new";

}



await customer.save();


};
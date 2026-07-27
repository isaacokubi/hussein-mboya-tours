import Customer from "../models/Customer.js";
import Booking from "../models/Booking.js";




/*
|--------------------------------------------------------------------------
| CREATE CUSTOMER
|--------------------------------------------------------------------------
|
| Agent creates customer
|
*/


export const createCustomer = async(req,res)=>{


try{


const customer = await Customer.create({

agent:req.user.agent,

...req.body

});




res.status(201)
.json({

success:true,

customer

});



}

catch(error){


console.error(error);


res.status(500)
.json({

success:false,

message:error.message

});


}


};








/*
|--------------------------------------------------------------------------
| GET AGENT CUSTOMERS
|--------------------------------------------------------------------------
*/


export const getCustomers = async(req,res)=>{


try{


const customers =

await Customer.find({

agent:req.user.agent,

status:"active"

})

.sort({

createdAt:-1

});





res.json({

success:true,

customers

});



}

catch(error){


res.status(500)
.json({

success:false,

message:error.message

});


}


};








/*
|--------------------------------------------------------------------------
| GET SINGLE CUSTOMER
|--------------------------------------------------------------------------
*/


export const getCustomer = async(req,res)=>{


try{


const customer =

await Customer.findOne({

_id:req.params.id,

agent:req.user.agent

});





if(!customer){


return res.status(404)
.json({

message:"Customer not found"

});


}







const bookings =

await Booking.find({

agent:req.user.agent,


$or:[

{
user:customer.user
},

{
"customerSnapshot.email":
customer.email
}

]

})


.populate(
"tour"
)

.sort({

createdAt:-1

});








res.json({

success:true,

customer,

bookings

});



}

catch(error){


res.status(500)
.json({

success:false,

message:error.message

});


}


};








/*
|--------------------------------------------------------------------------
| UPDATE CUSTOMER
|--------------------------------------------------------------------------
*/


export const updateCustomer = async(req,res)=>{


try{


const customer =

await Customer.findOneAndUpdate(

{

_id:req.params.id,

agent:req.user.agent

},


req.body,


{

new:true,

runValidators:true

}

);







if(!customer){


return res.status(404)
.json({

message:"Customer not found"

});


}






res.json({

success:true,

customer

});



}

catch(error){


res.status(500)
.json({

success:false,

message:error.message

});


}


};









/*
|--------------------------------------------------------------------------
| SOFT DELETE CUSTOMER
|--------------------------------------------------------------------------
*/


export const deleteCustomer = async(req,res)=>{


try{


const customer =

await Customer.findOneAndUpdate(

{

_id:req.params.id,

agent:req.user.agent

},


{

status:"inactive"

},


{

new:true

}

);







if(!customer){


return res.status(404)
.json({

message:"Customer not found"

});


}






res.json({

success:true,

message:"Customer deactivated"

});



}

catch(error){


res.status(500)
.json({

success:false,

message:error.message

});


}


};









/*
|--------------------------------------------------------------------------
| CUSTOMER STATISTICS
|--------------------------------------------------------------------------
|
| Agent CRM dashboard
|
*/


export const getCustomerStats = async(req,res)=>{


try{


const totalCustomers =

await Customer.countDocuments({

agent:req.user.agent,

status:"active"

});





const vipCustomers =

await Customer.countDocuments({

agent:req.user.agent,

customerType:"vip"

});





const totalRevenue =

await Customer.aggregate([

{

$match:{

agent:req.user.agent

}

},

{

$group:{

_id:null,

total:{

$sum:"$totalSpent"

}

}

}

]);







res.json({

success:true,


stats:{


customers:totalCustomers,


vipCustomers,


revenue:

totalRevenue[0]?.total || 0


}


});



}

catch(error){


res.status(500)
.json({

message:error.message

});


}


};
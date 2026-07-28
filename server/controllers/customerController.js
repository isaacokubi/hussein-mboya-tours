import User from "../models/User.js";

import Booking from "../models/Booking.js";




// ============================================================
// GET ALL CUSTOMERS
// ============================================================

export const getCustomers = async(req,res)=>{


try{


const {

search

}=req.query;




const filter={

role:"customer"

};





let customers = await User.find(filter)

.select(

"name email phone customerType createdAt"

);





if(search){


customers =
customers.filter(customer=>


customer.name
?.toLowerCase()
.includes(search.toLowerCase())


||

customer.email
?.toLowerCase()
.includes(search.toLowerCase())


);


}






const data =
await Promise.all(

customers.map(async(customer)=>{


const bookings =

await Booking.find({

customer:customer._id

});





const spending =

bookings.reduce(

(total,booking)=>

total +

(booking.amount || 0),

0

);





return {


...customer.toObject(),


totalBookings:

bookings.length,


totalSpent:

spending



};



})

);







res.json({

success:true,

customers:data

});



}

catch(error){


res.status(500).json({

message:error.message

});


}


};







// ============================================================
// CUSTOMER PROFILE
// ============================================================


export const getCustomerProfile = async(req,res)=>{


try{


const customer =

await User.findById(

req.params.id

)

.select(

"-password"

);





const bookings =

await Booking.find({

customer:req.params.id

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


res.status(500).json({

message:error.message

});


}


};
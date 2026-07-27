import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";





/*
|--------------------------------------------------------------------------
| TOUR MANAGER REPORTS
|--------------------------------------------------------------------------
*/


export const getTourReports = async(
req,
res
)=>{


try{



/*
|--------------------------------------------------------------------------
| TOTAL BOOKINGS
|--------------------------------------------------------------------------
*/


const totalBookings =

await Booking.countDocuments();







/*
|--------------------------------------------------------------------------
| REVENUE
|--------------------------------------------------------------------------
*/


const revenueResult =

await Booking.aggregate([


{

$match:{

paymentStatus:"paid"

}

},


{

$group:{

_id:null,

total:{

$sum:"$totalAmount"

}

}

}


]);




const totalRevenue =

revenueResult[0]?.total || 0;








/*
|--------------------------------------------------------------------------
| BOOKING STATUS
|--------------------------------------------------------------------------
*/


const bookingStatus =

await Booking.aggregate([


{

$group:{


_id:"$bookingStatus",


count:{

$sum:1

}


}


}



]);









/*
|--------------------------------------------------------------------------
| POPULAR TOURS
|--------------------------------------------------------------------------
*/


const popularTours =

await Booking.aggregate([


{

$group:{


_id:"$tour",


bookings:{

$sum:1

}


}

},


{

$sort:{

bookings:-1

}

},


{

$limit:5

},



{

$lookup:{


from:"tours",

localField:"_id",

foreignField:"_id",

as:"tour"


}

},


{

$unwind:"$tour"

}


]);









/*
|--------------------------------------------------------------------------
| MONTHLY REVENUE
|--------------------------------------------------------------------------
*/


const monthlyRevenue =

await Booking.aggregate([


{

$match:{

paymentStatus:"paid"

}

},


{

$group:{


_id:{

month:{
$month:"$createdAt"
},

year:{
$year:"$createdAt"
}


},



revenue:{

$sum:"$totalAmount"

}



}


},


{

$sort:{

"_id.year":1,

"_id.month":1

}

}



]);









/*
|--------------------------------------------------------------------------
| CUSTOMERS
|--------------------------------------------------------------------------
*/


const totalCustomers =

await User.countDocuments({

legacyRole:"customer"

});








/*
|--------------------------------------------------------------------------
| TOURS
|--------------------------------------------------------------------------
*/


const totalTours =

await Tour.countDocuments();



const completedTours =

await Tour.countDocuments({

status:"completed"

});









res.json({

success:true,


reports:{


totalBookings,

totalRevenue,

totalCustomers,

totalTours,

completedTours,

bookingStatus,

popularTours,

monthlyRevenue


}



});



}

catch(error){


res.status(500).json({

message:error.message

});


}



};
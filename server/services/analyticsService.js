import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import Tour from "../models/Tour.js";



export const getRevenueAnalytics =
async()=>{


const revenue =
await Booking.aggregate([


{

$match:{

paymentStatus:"paid"

}

},


{

$group:{

_id:null,

totalRevenue:{

$sum:"$amount"

}


}

}


]);



return revenue[0] || {

totalRevenue:0

};


};





export const getBookingAnalytics =
async()=>{


return await Booking.aggregate([


{

$group:{

_id:{

$dateToString:{

format:"%Y-%m",

date:"$createdAt"

}

},


bookings:{

$sum:1

}

}

}


]);


};





export const getPopularTours =
async()=>{


return await Booking.aggregate([


{

$group:{


_id:"$tour",


totalBookings:{

$sum:1

}


}

},


{

$sort:{

totalBookings:-1

}

},


{

$limit:10

},


{

$lookup:{

from:"tours",

localField:"_id",

foreignField:"_id",

as:"tour"

}

}


]);


};
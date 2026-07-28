import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";


import {
    getRevenueAnalytics,
    getBookingAnalytics,
    getPopularTours
} from "../services/analyticsService.js";





// ============================================================
// ADMIN ANALYTICS DASHBOARD
// ============================================================

export const getAnalytics = async(req,res,next)=>{


try{


// REVENUE

const revenue =
await getRevenueAnalytics();




// BOOKINGS

const bookings =
await getBookingAnalytics();




// POPULAR TOURS

const popularTours =
await getPopularTours();





// TOTAL CUSTOMERS

const customers =
await User.countDocuments({

role:"customer"

});






// BOOKING STATUS

const bookingStatus =
await Booking.aggregate([

{
$group:{

_id:"$status",

count:{
$sum:1
}

}

}

]);







// MONTHLY BOOKING ANALYTICS

const monthlyRevenue =
await Booking.aggregate([


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

}


]);







// VEHICLE UTILIZATION

const vehicleStats =
await Vehicle.aggregate([


{
$group:{


_id:"$status",

count:{
$sum:1
}


}

}


]);







res.status(200).json({

success:true,


data:{


revenue,


customers,


bookings,


bookingStatus,


monthlyRevenue,


popularTours,


vehicleStats


}


});





}
catch(error){


next(error);


}


};









// ============================================================
// TOUR MANAGER DASHBOARD ANALYTICS
// ============================================================


export const dashboardAnalytics = async(req,res,next)=>{


try{


const revenue =
await getRevenueAnalytics();




const bookings =
await getBookingAnalytics();




const popularTours =
await getPopularTours();





res.status(200).json({

success:true,


data:{


revenue,


bookings,


popularTours


}


});



}
catch(error){


next(error);


}


};
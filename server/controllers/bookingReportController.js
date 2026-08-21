import { mergeTenantFilter } from "../tenancy/context.js";


import Booking from "../models/Booking.js";


/*
|--------------------------------------------------------------------------
| DAILY REPORT
|--------------------------------------------------------------------------
*/


export const dailyBookingReport =
async(req,res,next)=>{

try{


const start =
new Date();

start.setHours(
0,0,0,0
);


const end =
new Date();

end.setHours(
23,59,59,999
);



const bookings =
await Booking.find({

createdAt:{
$gte:start,
$lte:end
}

})
.populate(
"tour",
"title"
)
.populate(
"agent",
"name"
);



res.json({

success:true,

count:bookings.length,

bookings

});


}catch(error){

next(error)

}

};




/*
|--------------------------------------------------------------------------
| MONTHLY REPORT
|--------------------------------------------------------------------------
*/


export const monthlyBookingReport =
async(req,res,next)=>{

try{


const year =
Number(req.query.year)
||
new Date().getFullYear();



const month =
Number(req.query.month)
||
new Date().getMonth()+1;



const start =
new Date(
year,
month-1,
1
);



const end =
new Date(
year,
month,
0,
23,
59,
59
);



const bookings =
await Booking.find({

createdAt:{
$gte:start,
$lte:end
}

})
.populate(
"tour",
"title"
);



res.json({

success:true,

year,

month,

count:
bookings.length,

bookings

});


}catch(error){

next(error)

}

};




/*
|--------------------------------------------------------------------------
| TOUR REPORT
|--------------------------------------------------------------------------
*/


export const tourBookingReport =
async(req,res,next)=>{

try{


const data =
await Booking.aggregate([

{
$group:{

_id:"$tour",

totalBookings:{
$count:{}
},

revenue:{
$sum:"$totalAmount"
}

}

}

]);



res.json({

success:true,

data

});


}catch(error){

next(error)

}

};




/*
|--------------------------------------------------------------------------
| AGENT REPORT
|--------------------------------------------------------------------------
*/


export const agentBookingReport =
async(req,res,next)=>{

try{


const data =
await Booking.aggregate([

{
$group:{

_id:"$agent",

totalBookings:{
$count:{}
},

revenue:{
$sum:"$totalAmount"
}

}

}

]);



res.json({

success:true,

data

});


}catch(error){

next(error)

}

};


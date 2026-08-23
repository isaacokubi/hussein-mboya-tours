import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Tour from "../models/Tour.js";


export const getTourRecommendations = async(
req,
res,
next
)=>{
  requireTenantId();

try{


const {
customerId
}=req.params;



const customer =
await User.findById(customerId)
.select(
"name email preferences"
)
.lean();



if(!customer){

return res.status(404).json({

success:false,

message:"Customer not found"

});

}



const previousBookings =
await Booking.find({

user:customerId

})
.populate(
"tour"
)
.lean();



const bookedTourIds =
previousBookings
.map(
booking =>
booking.tour?._id
)
.filter(Boolean);



const recommendedTours =
await Tour.find({

_id:{
$nin:bookedTourIds
}

})
.limit(10)
.lean();



const recommendations =
recommendedTours.map(
tour=>({

tourId:tour._id,

tour:tour.title,

destination:
tour.destination?.name ||
"Africa",

price:
tour.price || 0,

reason:
"Recommended based on available tours and customer history."

})
);



res.json({

success:true,

data:{

customer:{

id:customer._id,

name:customer.name

},

recommendations

}

});


}catch(error){

next(error);

}

};

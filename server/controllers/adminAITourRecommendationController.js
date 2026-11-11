/**
 * Purpose: admin AITour Recommendation Controller HTTP controller. Main declarations: getTourRecommendations.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../models/Booking.js so this module can use its exported dependencies.
import Booking from "../models/Booking.js";
// Load ../models/Tour.js so this module can use its exported dependencies.
import Tour from "../models/Tour.js";


// Declare getTourRecommendations for use by the surrounding module or function.
export const getTourRecommendations = async(
req,
res,
next
)=>{
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();

// Run this operation with a dedicated error-handling path for failures.
try{


// Declare { customerId } for use by the surrounding module or function.
const {
customerId
}=req.params;



// Declare customer for use by the surrounding module or function.
const customer =
await User.findById(customerId)
.select(
"name email preferences"
)
.lean();



// Check the condition (!customer) and run the matching branch.
if(!customer){

// Return the result of res.status(404).json() to the caller.
return res.status(404).json({

success:false,

message:"Customer not found"

});

}



// Declare previousBookings for use by the surrounding module or function.
const previousBookings =
await Booking.find({

user:customerId

})
.populate(
"tour"
)
.lean();



// Declare bookedTourIds for use by the surrounding module or function.
const bookedTourIds =
previousBookings
.map(
booking =>
booking.tour?._id
)
.filter(Boolean);



// Declare recommendedTours for use by the surrounding module or function.
const recommendedTours =
await Tour.find({

_id:{
$nin:bookedTourIds
}

})
.limit(10)
.lean();



// Declare recommendations for use by the surrounding module or function.
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



// Perform the side effect or state update expressed on the following line.
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

// Perform the side effect or state update expressed on the following line.
next(error);

}

};

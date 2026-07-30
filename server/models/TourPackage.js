import mongoose from "mongoose";



/*
|--------------------------------------------------------------------------
| TOUR PACKAGE MODEL
|--------------------------------------------------------------------------
|
| Admin/Tour Manager creates packages.
|
| Customer Price
|        |
|        ↓
|    basePrice
|
| Agent Selling Price
|        |
|        ↓
|    agentPrice
|
| Agent selects package.
| Agent never enters price manually.
|
*/



const tourPackageSchema = new mongoose.Schema(

{


/*
|--------------------------------------------------------------------------
| BASIC INFORMATION
|--------------------------------------------------------------------------
*/


title:{

type:String,

required:true,

trim:true

},



slug:{

type:String,

unique:true,

lowercase:true,

trim:true

},



description:{

type:String,

default:"",

trim:true

},







/*
|--------------------------------------------------------------------------
| DESTINATION
|--------------------------------------------------------------------------
*/


destination:{

type:String,

required:true,

trim:true

},



country:{

type:String,

default:"Kenya",

trim:true

},



startLocation:{

type:String,

default:"",

trim:true

},







/*
|--------------------------------------------------------------------------
| TOUR CATEGORY
|--------------------------------------------------------------------------
*/


category:{

type:String,

enum:[

"Safari",

"Beach",

"Adventure",

"City Tour",

"Mountain",

"Culture",

"Honeymoon",

"Luxury"

],

required:true

},







/*
|--------------------------------------------------------------------------
| DURATION
|--------------------------------------------------------------------------
*/


duration:{

type:String,

required:true

},



numberOfDays:{

type:Number,

default:1,

min:1

},







/*
|--------------------------------------------------------------------------
| IMAGES
|--------------------------------------------------------------------------
*/


coverImage:{

type:String,

default:""

},



gallery:[

String

],







/*
|--------------------------------------------------------------------------
| PRICING
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| Admin controls these values.
|
| Agents only select packages.
|
*/


basePrice:{

type:Number,

required:true,

min:0

},



agentPrice:{

type:Number,

required:true,

min:0

},



currency:{

type:String,

default:"KES"

},







/*
|--------------------------------------------------------------------------
| CAPACITY
|--------------------------------------------------------------------------
*/


maxGuests:{

type:Number,

default:10,

min:1

},



availableSeats:{

type:Number,

default:10,

min:0

},







/*
|--------------------------------------------------------------------------
| ITINERARY
|--------------------------------------------------------------------------
*/


itinerary:[

{

day:{

type:Number,

required:true

},


title:{

type:String,

required:true,

trim:true

},


description:{

type:String,

default:"",

trim:true

}

}

],







/*
|--------------------------------------------------------------------------
| PACKAGE FEATURES
|--------------------------------------------------------------------------
*/


inclusions:[

String

],



exclusions:[

String

],







/*
|--------------------------------------------------------------------------
| BOOKING CONTROL
|--------------------------------------------------------------------------
*/


minimumGuests:{

type:Number,

default:1,

min:1

},



bookingDeadline:{

type:Number,

default:1,

min:1

},







/*
|--------------------------------------------------------------------------
| STATUS
|--------------------------------------------------------------------------
*/


status:{

type:String,

enum:[

"draft",

"active",

"inactive",

"sold_out"

],

default:"active"

},







/*
|--------------------------------------------------------------------------
| OWNERSHIP
|--------------------------------------------------------------------------
*/


createdBy:{

type:mongoose.Schema.Types.ObjectId,

ref:"User",

required:true

},







/*
|--------------------------------------------------------------------------
| MARKETING
|--------------------------------------------------------------------------
*/


featured:{

type:Boolean,

default:false

},



views:{

type:Number,

default:0,

min:0

}



},


{

timestamps:true,


toJSON:{

virtuals:true

},


toObject:{

virtuals:true

}

}

);








/*
|--------------------------------------------------------------------------
| AUTO CREATE SLUG
|--------------------------------------------------------------------------
*/


tourPackageSchema.pre(

"save",

function(next){


if(!this.slug){


this.slug = this.title

.toLowerCase()

.replace(

/[^a-z0-9]+/g,

"-"

)

.replace(

/(^-|-$)/g,

""

);


}


next();


}

);








/*
|--------------------------------------------------------------------------
| DATABASE INDEXES
|--------------------------------------------------------------------------
*/


tourPackageSchema.index({

destination:1

});



tourPackageSchema.index({

category:1

});



tourPackageSchema.index({

status:1

});



tourPackageSchema.index({

featured:1

});







const TourPackage =

mongoose.models.TourPackage ||

mongoose.model(

"TourPackage",

tourPackageSchema

);



export default TourPackage;
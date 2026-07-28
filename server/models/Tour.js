import mongoose from "mongoose";
import slugify from "slugify";



/*
|--------------------------------------------------------------------------
| ITINERARY SCHEMA
|--------------------------------------------------------------------------
*/

const itinerarySchema = new mongoose.Schema(

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
        required:true,
        trim:true
    }

},

{
    _id:false
}

);







/*
|--------------------------------------------------------------------------
| AVAILABILITY SCHEMA
|--------------------------------------------------------------------------
*/

const availabilitySchema = new mongoose.Schema(

{

    date:{
        type:Date,
        required:true
    },


    slots:{
        type:Number,
        default:0,
        min:0
    }

},

{
    _id:false
}

);








/*
|--------------------------------------------------------------------------
| SEO SCHEMA
|--------------------------------------------------------------------------
*/

const seoSchema = new mongoose.Schema(

{

    title:String,

    description:String,

    keywords:[String]

},

{
    _id:false
}

);









/*
|--------------------------------------------------------------------------
| TOUR MODEL
|--------------------------------------------------------------------------
*/


const tourSchema = new mongoose.Schema(

{

/*
|--------------------------------------------------------------------------
| BASIC INFORMATION
|--------------------------------------------------------------------------
*/


name:{

    type:String,

    trim:true

},



title:{

    type:String,

    required:true,

    trim:true,

    maxlength:150

},



slug:{

    type:String,

    unique:true,

    lowercase:true,

    trim:true

},



description:{

    type:String,

    required:true,

    trim:true

},



shortDescription:{

    type:String,

    maxlength:200,

    trim:true

},





category:{

    type:String,

    enum:[

        "Safari",

        "Beach",

        "Adventure",

        "Cultural",

        "Luxury"

    ],

    default:"Safari"

},







/*
|--------------------------------------------------------------------------
| LOCATION
|--------------------------------------------------------------------------
*/


destination:{

    type:mongoose.Schema.Types.ObjectId,

    ref:"Destination",

    required:true

},



country:{

    type:String,

    required:true

},



location:{

    type:String,

    required:true

},









/*
|--------------------------------------------------------------------------
| TOUR DATE AND OPERATION
|--------------------------------------------------------------------------
*/


date:{

    type:Date,

    required:true

},




startDate:{

    type:Date,

    default:null

},




endDate:{

    type:Date,

    default:null

},




tourStatus:{

    type:String,

    enum:[

        "scheduled",

        "ongoing",

        "completed",

        "cancelled"

    ],

    default:"scheduled"

},





duration:{

    type:String

},




durationDetails:{

    days:Number,

    nights:Number

},







capacity:{

    type:Number,

    default:20,

    min:1

},





maxGuests:{

    type:Number,

    default:20

},





maxTravelers:{

    type:Number,

    default:20

},







/*
|--------------------------------------------------------------------------
| VEHICLE
|--------------------------------------------------------------------------
*/


vehicle:{

    type:mongoose.Schema.Types.ObjectId,

    ref:"Vehicle"

},







/*
|--------------------------------------------------------------------------
| TOUR DETAILS
|--------------------------------------------------------------------------
*/


difficulty:{

    type:String,

    enum:[

        "easy",

        "moderate",

        "hard"

    ],

    default:"easy"

},




price:{

    type:Number,

    required:true,

    min:0

},




agentPrice:{

    type:Number,

    default:0

},




discount:{

    type:Number,

    default:0

},




discountPrice:{

    type:Number,

    default:null

},







/*
|--------------------------------------------------------------------------
| MEDIA
|--------------------------------------------------------------------------
*/


image:String,



images:[

{

    url:String,

    publicId:String

}

],



gallery:[String],




video:{

    url:String

},







/*
|--------------------------------------------------------------------------
| TOUR CONTENT
|--------------------------------------------------------------------------
*/


highlights:[String],



included:[String],



excluded:[String],



inclusions:[String],



exclusions:[String],







/*
|--------------------------------------------------------------------------
| ITINERARY
|--------------------------------------------------------------------------
*/


itinerary:[

    itinerarySchema

],









/*
|--------------------------------------------------------------------------
| AVAILABILITY
|--------------------------------------------------------------------------
*/


availableDates:[

    availabilitySchema

],



availability:[

    availabilitySchema

],




availabilitySettings:{


    totalSlots:{

        type:Number,

        default:20

    },


    bookedSlots:{

        type:Number,

        default:0

    }


}, /*
|--------------------------------------------------------------------------
| PRICING RULES
|--------------------------------------------------------------------------
*/


pricingRules:[

{

    name:String,


    minTravelers:Number,


    discount:{

        type:Number,

        default:0

    }

}

],









/*
|--------------------------------------------------------------------------
| BOOKING RULES
|--------------------------------------------------------------------------
*/


cancellationPolicy:String,





depositRequired:{

    type:Number,

    default:0

},










/*
|--------------------------------------------------------------------------
| TOUR OPERATIONS ASSIGNMENTS
|--------------------------------------------------------------------------
|
| Assigned:
|
| Guide
| Driver
| Vehicle
|
|--------------------------------------------------------------------------
*/


assignedGuide:{

    type:mongoose.Schema.Types.ObjectId,

    ref:"Staff",

    default:null

},





assignedDriver:{

    type:mongoose.Schema.Types.ObjectId,

    ref:"Staff",

    default:null

},





assignedVehicle:{

    type:mongoose.Schema.Types.ObjectId,

    ref:"Vehicle",

    default:null

},






assignmentStatus:{

    type:String,

    enum:[

        "pending",

        "assigned",

        "completed",

        "cancelled"

    ],

    default:"pending"

},










/*
|--------------------------------------------------------------------------
| ADMIN MANAGEMENT
|--------------------------------------------------------------------------
*/


createdBy:{

    type:mongoose.Schema.Types.ObjectId,

    ref:"User",

    default:null

},







/*
|--------------------------------------------------------------------------
| REVIEWS
|--------------------------------------------------------------------------
*/


rating:{

    type:Number,

    default:0,

    min:0,

    max:5

},





totalReviews:{

    type:Number,

    default:0

},





averageRating:{

    type:Number,

    default:0

},







/*
|--------------------------------------------------------------------------
| TOUR VISIBILITY MANAGEMENT
|--------------------------------------------------------------------------
*/


featured:{

    type:Boolean,

    default:false

},





available:{

    type:Boolean,

    default:true

},





status:{

    type:String,

    enum:[

        "draft",

        "upcoming",

        "active",

        "ongoing",

        "fully-booked",

        "completed",

        "cancelled"

    ],

    default:"draft"

},





isDeleted:{

    type:Boolean,

    default:false

},







/*
|--------------------------------------------------------------------------
| SEO
|--------------------------------------------------------------------------
*/


seo:seoSchema




},

{


timestamps:true


}

);









/*
|--------------------------------------------------------------------------
| AUTO SLUG GENERATION
|--------------------------------------------------------------------------
*/


tourSchema.pre(

"validate",

function(next){



if(

this.title &&

(

!this.slug ||

this.isModified("title")

)

)

{


this.slug = slugify(

this.title,

{

lower:true,

strict:true,

trim:true

}

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


tourSchema.index({

title:"text",

description:"text",

country:"text",

location:"text",

category:"text"

});





tourSchema.index({

destination:1,

status:1,

featured:1

});







/*
|--------------------------------------------------------------------------
| TOUR OPERATIONS INDEXES
|--------------------------------------------------------------------------
*/


tourSchema.index({

assignedGuide:1,

tourStatus:1

});





tourSchema.index({

assignedDriver:1,

assignmentStatus:1

});





tourSchema.index({

assignedVehicle:1

});





tourSchema.index({

tourStatus:1,

startDate:1,

endDate:1

});







/*
|--------------------------------------------------------------------------
| SEARCH / FILTER INDEXES
|--------------------------------------------------------------------------
*/


tourSchema.index({

price:1

});





tourSchema.index({

averageRating:-1

});





tourSchema.index({

available:1

});





tourSchema.index({

isDeleted:1

});









/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/


const Tour =

mongoose.models.Tour ||

mongoose.model(

"Tour",

tourSchema

);



export default Tour;
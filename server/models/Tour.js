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


    availableSlots:{
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

    title:{
        type:String,
        trim:true
    },


    description:{
        type:String,
        trim:true
    },


    keywords:[
        {
            type:String,
            trim:true
        }
    ]

},
{
    _id:false
}
);








/*
|--------------------------------------------------------------------------
| TOUR SCHEMA
|--------------------------------------------------------------------------
*/

const tourSchema = new mongoose.Schema(

{

/*
|--------------------------------------------------------------------------
| BASIC INFORMATION
|--------------------------------------------------------------------------
*/


title:{
    type:String,
    required:true,
    trim:true,
    maxlength:150
},



// REMOVED index:true
// slug index handled below

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
    trim:true,
    maxlength:200
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



destination:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Destination",
    required:true
},



country:{
    type:String,
    required:true,
    trim:true
},



location:{
    type:String,
    required:true,
    trim:true
},



/*
|--------------------------------------------------------------------------
| TOUR DATE
|--------------------------------------------------------------------------
*/


date:{
    type:Date,
    required:true
},



duration:{
    type:String,
    required:true
},



capacity:{
    type:Number,
    default:20,
    min:1
},



maxTravelers:{
    type:Number,
    default:20,
    min:1
},



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



discount:{
    type:Number,
    default:0,
    min:0
},



discountPrice:{
    type:Number,
    default:null,
    min:0
},



/*
|--------------------------------------------------------------------------
| MEDIA
|--------------------------------------------------------------------------
*/


image:{
    type:String,
    required:true
},



images:[
    String
],



gallery:[
    String
],/*
|--------------------------------------------------------------------------
| TOUR CONTENT
|--------------------------------------------------------------------------
*/


highlights:[
    String
],



inclusions:[
    String
],



exclusions:[
    String
],



included:[
    String
],



excluded:[
    String
],







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
    Date
],



availability:[
    availabilitySchema
],



availabilitySettings:{

    totalSlots:{
        type:Number,
        default:20,
        min:0
    },


    bookedSlots:{
        type:Number,
        default:0,
        min:0
    }

},







/*
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


cancellationPolicy:{
    type:String,
    trim:true
},



depositRequired:{
    type:Number,
    default:0,
    min:0
},







/*
|--------------------------------------------------------------------------
| ASSIGNMENTS
|--------------------------------------------------------------------------
*/


guide:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
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



reviewsCount:{
    type:Number,
    default:0
},



averageRating:{
    type:Number,
    default:0,
    min:0,
    max:5
},







/*
|--------------------------------------------------------------------------
| FEATURED AND STATUS
|--------------------------------------------------------------------------
*/


// REMOVED index:true

featured:{
    type:Boolean,
    default:false
},



// REMOVED index:true

available:{
    type:Boolean,
    default:true
},



// REMOVED index:true

status:{

    type:String,

    enum:[

        "draft",
        "upcoming",
        "ongoing",
        "completed",
        "cancelled"

    ],

    default:"upcoming"

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
        (!this.slug || this.isModified("title"))
    ){

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

});









/*
|--------------------------------------------------------------------------
| DATABASE INDEXES
|--------------------------------------------------------------------------
*/


// Search

tourSchema.index({

    title:"text",

    description:"text",

    shortDescription:"text",

    country:"text",

    location:"text",

    category:"text"

});




// Destination filtering

tourSchema.index({

    destination:1,

    status:1,

    featured:1

});




// Guide dashboard

tourSchema.index({

    guide:1,

    status:1

});




// Vehicle lookup

tourSchema.index({

    vehicle:1

});




// Date sorting

tourSchema.index({

    date:1

});




// Price filtering

tourSchema.index({

    price:1

});




// Rating sorting

tourSchema.index({

    averageRating:-1

});




// Availability filtering

tourSchema.index({

    available:1

});









export default mongoose.model(

    "Tour",

    tourSchema

);
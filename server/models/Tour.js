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
        required:true,
    },


    title:{
        type:String,
        required:true,
        trim:true,
    },


    description:{
        type:String,
        required:true,
        trim:true,
    },


},
{
    _id:false,
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
        required:true,
    },


    availableSlots:{
        type:Number,
        required:true,
        default:0,
        min:0,
    },


},
{
    _id:false,
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
        trim:true,
    },


    description:{
        type:String,
        trim:true,
    },


    keywords:[
        {
            type:String,
            trim:true,
        }
    ],


},
{
    _id:false,
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
    maxlength:150,
},




slug:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
    index:true,
},




description:{
    type:String,
    required:true,
    trim:true,
},




category:{
    type:String,
    required:true,
    trim:true,
},




destination:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Destination",
    required:true,
},




country:{
    type:String,
    required:true,
    trim:true,
},







/*
|--------------------------------------------------------------------------
| TOUR SCHEDULE (TOUR MANAGER)
|--------------------------------------------------------------------------
*/


date:{
    type:Date,
    required:true,
},




capacity:{
    type:Number,
    default:20,
    min:1,
},




vehicle:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Vehicle",
},







/*
|--------------------------------------------------------------------------
| TOUR DETAILS
|--------------------------------------------------------------------------
*/


duration:{
    type:Number,
    required:true,
    min:1,
},




difficulty:{
    type:String,

    enum:[

        "easy",
        "moderate",
        "hard"

    ],

    default:"easy",
},




price:{
    type:Number,
    required:true,
    min:0,
},




discount:{
    type:Number,
    default:0,
    min:0,
},







/*
|--------------------------------------------------------------------------
| MEDIA
|--------------------------------------------------------------------------
*/


images:[

    {
        type:String
    }

],







/*
|--------------------------------------------------------------------------
| ITINERARY
|--------------------------------------------------------------------------
*/


 itinerary:[

    itinerarySchema

],




inclusions:[

    {
        type:String,
        trim:true
    }

],




exclusions:[

    {
        type:String,
        trim:true
    }

],







/*
|--------------------------------------------------------------------------
| AVAILABILITY
|--------------------------------------------------------------------------
*/


availableDates:[

    {
        type:Date
    }

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


name:{

    type:String,

    trim:true

},



minTravelers:{

    type:Number,

    min:1

},



discount:{

    type:Number,

    default:0,

    min:0

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




maxTravelers:{

    type:Number,

    default:20,

    min:1

},







/*
|--------------------------------------------------------------------------
| GUIDE ASSIGNMENT
|--------------------------------------------------------------------------
*/


guide:{

    type:mongoose.Schema.Types.ObjectId,

    ref:"User"

},







/*
|--------------------------------------------------------------------------
| TOUR REPORT
|--------------------------------------------------------------------------
*/


tourReport:{


    notes:{

        type:String,

        trim:true

    },



    photos:[

        {
            type:String
        }

    ],



    submittedAt:{

        type:Date

    }


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
| FEATURED
|--------------------------------------------------------------------------
*/


featured:{

    type:Boolean,

    default:false,

    index:true

},







/*
|--------------------------------------------------------------------------
| SEO
|--------------------------------------------------------------------------
*/


seo:seoSchema,








/*
|--------------------------------------------------------------------------
| TOUR STATUS
|--------------------------------------------------------------------------
*/


status:{


    type:String,


    enum:[


        "draft",

        "upcoming",

        "ongoing",

        "completed",

        "cancelled"


    ],


    default:"upcoming",


    index:true


}





},

{

    timestamps:true

}

);









/*
|--------------------------------------------------------------------------
| AUTO CREATE SLUG
|--------------------------------------------------------------------------
*/


tourSchema.pre(

"validate",

function(next){


    if(

        this.title &&

        (!this.slug || this.isModified("title"))

    ){


        this.slug =
        slugify(

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
| SEARCH INDEX
|--------------------------------------------------------------------------
*/


tourSchema.index({

    title:"text",

    description:"text",

    country:"text",

    category:"text"

});







/*
|--------------------------------------------------------------------------
| PERFORMANCE INDEXES
|--------------------------------------------------------------------------
*/


tourSchema.index({

    destination:1,

    status:1,

    featured:1

});




tourSchema.index({

    guide:1,

    status:1

});




tourSchema.index({

    vehicle:1

});




tourSchema.index({

    date:1

});




tourSchema.index({

    averageRating:-1

});




tourSchema.index({

    price:1

});









export default mongoose.model(

"Tour",

tourSchema

);
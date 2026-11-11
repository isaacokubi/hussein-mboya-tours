/**
 * Purpose: Destination database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/Destination.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";
// Load slugify so this module can use its exported dependencies.
import slugify from "slugify";


/*
|--------------------------------------------------------------------------
| DESTINATION SCHEMA
|--------------------------------------------------------------------------
*/

// Declare destinationSchema for use by the surrounding module or function.
const destinationSchema = new mongoose.Schema(

    {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index:true },

        /*
        |--------------------------------------------------------------------------
        | BASIC INFORMATION
        |--------------------------------------------------------------------------
        */


        name: {

            type: String,

            required: true,

            trim: true,

            maxlength: 150,

        },


        slug: {

            type: String,

      
            lowercase: true,

            trim: true,

        },


        country: {

            type: String,

            default: "Kenya",

            required: true,

            trim: true,

        },


        region: {

            type: String,

            default: "",

            trim: true,

        },


        city: {

            type: String,

            default: "",

            trim: true,

        },



        /*
        |--------------------------------------------------------------------------
        | DESCRIPTION
        |--------------------------------------------------------------------------
        */


        shortDescription: {

            type: String,

            maxlength: 300,

            default: "",

        },


        description: {

            type: String,

            required: true,

        },



        /*
        |--------------------------------------------------------------------------
        | MEDIA
        |--------------------------------------------------------------------------
        */


        featuredImage: {

            type: String,

            default: "",

        },




    seo: {

      metaTitle: {
        type:String,
        trim:true
      },

      metaDescription:{
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

images: [

            {

                url: {

                    type: String,

                    required: true,

                },


                publicId: {

                    type: String,

                    default: "",

                },


            }

        ],



        video: {

            type: String,

            default: "",

        },



        /*
        |--------------------------------------------------------------------------
        | TOURISM INFORMATION
        |--------------------------------------------------------------------------
        */


        attractions: [

            {

                type: String,

                trim: true,

            }

        ],



        activities: [

            {

                type: String,

                trim: true,

            }

        ],



        languages: [

            {

                type: String,

                trim: true,

            }

        ],



        currency: {

            type: String,

            default: "",

        },



        timezone: {

            type: String,

            default: "",

        },





        /*
        |--------------------------------------------------------------------------
        | WEATHER
        |--------------------------------------------------------------------------
        */


        bestSeason: {

            type: String,

            enum: [

                "Spring",

                "Summer",

                "Autumn",

                "Winter",

                "All Year"

            ],

            default: "All Year",

        },



        weather: {

            type: String,

            default: "",

        },



        averageTemperature: {

            type: Number,

            default: null,

        },





        /*
        |--------------------------------------------------------------------------
        | LOCATION
        |--------------------------------------------------------------------------
        */


        coordinates: {


            latitude: {

                type: Number,

                min: -90,

                max: 90,

            },


            longitude: {

                type: Number,

                min: -180,

                max: 180,

            }


        },





        /*
        |--------------------------------------------------------------------------
        | POPULARITY
        |--------------------------------------------------------------------------
        */


        averageRating: {

            type: Number,

            default: 0,

            min: 0,

            max: 5,

        },



        totalReviews: {

            type: Number,

            default: 0,

        },



        totalTours: {

            type: Number,

            default: 0,

        },



        totalBookings: {

            type: Number,

            default: 0,

        },





        /*
        |--------------------------------------------------------------------------
        | FEATURES
        |--------------------------------------------------------------------------
        */


        featured: {

            type: Boolean,

            default: false,

        },



        popular: {

            type: Boolean,

            default: false,

        },





        /*
        |--------------------------------------------------------------------------
        | STATUS
        |--------------------------------------------------------------------------
        */


        status: {

            type: String,

            enum: [

                "active",

                "inactive"

            ],

            default: "active",

        },



        active: {

            type: Boolean,

            default: true,

        },



        isDeleted: {

            type: Boolean,

            default: false,

        },





        /*
        |--------------------------------------------------------------------------
        | SEO
        |--------------------------------------------------------------------------
        */


        seo: {


            title: {

                type: String,

                default: "",

            },


            description: {

                type: String,

                default: "",

            },


            keywords: [

                {

                    type: String,

                    trim: true,

                }

            ]


        },


    },



    {

        timestamps: true,


        toJSON: {

            virtuals: true,

        },


        toObject: {

            virtuals: true,

        },


    }



);






/*
|--------------------------------------------------------------------------
| AUTO SLUG GENERATION
|--------------------------------------------------------------------------
*/


// Perform the side effect or state update expressed on the following line.
destinationSchema.pre(
    "save",
    function(next){

        // Check the condition (!this.slug && this.name) and run the matching branch.
        if(
            !this.slug &&
            this.name
        ){

            // Perform the side effect or state update expressed on the following line.
            this.slug = slugify(
                this.name,
                {

                    lower:true,

                    strict:true,

                    trim:true,

                }
            );

        }


        // Perform the side effect or state update expressed on the following line.
        next();


    }

);







/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/


// Perform the side effect or state update expressed on the following line.
destinationSchema.virtual("image").get(function () {
    // Return the expression shown below to the caller.
    return this.images?.[0]?.url || this.featuredImage || "";
});

// Perform the side effect or state update expressed on the following line.
destinationSchema.virtual("imageUrl").get(function () {
    // Return the expression shown below to the caller.
    return this.images?.[0]?.url || this.featuredImage || "";
});

// Perform the side effect or state update expressed on the following line.
destinationSchema.virtual(
    "location"
)
.get(function(){


    // Return the result of [          this.city,          this.region,          this.country       ]      .filter(Boolean)      .join() to the caller.
    return [

        this.city,

        this.region,

        this.country


    ]

    .filter(Boolean)

    .join(", ");


});








/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/





// Perform the side effect or state update expressed on the following line.
destinationSchema.index({

    country:1

});

// Perform the side effect or state update expressed on the following line.
destinationSchema.index({ tenantId: 1, slug: 1 }, { unique: true, partialFilterExpression: { slug: { $type: "string" } } });


// Perform the side effect or state update expressed on the following line.
destinationSchema.index({

    region:1

});


// Perform the side effect or state update expressed on the following line.
destinationSchema.index({

    city:1

});


// Perform the side effect or state update expressed on the following line.
destinationSchema.index({

    featured:1

});


// Perform the side effect or state update expressed on the following line.
destinationSchema.index({

    popular:1

});


// Perform the side effect or state update expressed on the following line.
destinationSchema.index({

    status:1

});


// Perform the side effect or state update expressed on the following line.
destinationSchema.index({

    active:1

});


// Perform the side effect or state update expressed on the following line.
destinationSchema.index({

    averageRating:-1

});


// Perform the side effect or state update expressed on the following line.
destinationSchema.index({

    totalBookings:-1

});


// Perform the side effect or state update expressed on the following line.
destinationSchema.index({

    isDeleted:1

});







/*
|--------------------------------------------------------------------------
| METHODS
|--------------------------------------------------------------------------
*/


// Perform the side effect or state update expressed on the following line.
destinationSchema.methods.updateRating =
function(rating){


    // Perform the side effect or state update expressed on the following line.
    this.averageRating = rating;


    // Return the result of this.save() to the caller.
    return this.save();


};







/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/


// Perform the side effect or state update expressed on the following line.
destinationSchema.plugin(tenantPlugin);

// Declare Destination for use by the surrounding module or function.
const Destination = mongoose.model(
    "Destination",
    destinationSchema,
    "destinations"
);










export default Destination;

// server/models/Destination.js

import mongoose from "mongoose";
import slugify from "slugify";


/*
|--------------------------------------------------------------------------
| DESTINATION SCHEMA
|--------------------------------------------------------------------------
*/

const destinationSchema = new mongoose.Schema(

{
/*
|--------------------------------------------------------------------------
| BASIC INFORMATION
|--------------------------------------------------------------------------
*/

name:{
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


country:{
    type:String,
    default:"Kenya",
    required:true,
    trim:true
},


region:{
    type:String,
    default:"",
    trim:true
},


city:{
    type:String,
    default:"",
    trim:true
},



/*
|--------------------------------------------------------------------------
| DESCRIPTION
|--------------------------------------------------------------------------
*/


shortDescription:{
    type:String,
    maxlength:300,
    default:""
},


description:{
    type:String,
    required:true
},



/*
|--------------------------------------------------------------------------
| MEDIA
|--------------------------------------------------------------------------
*/


featuredImage:{
    type:String,
    default:""
},


images:[

{
    url:{
        type:String,
        required:true
    },

    publicId:{
        type:String,
        default:""
    }
}

],



video:{
    type:String,
    default:""
},




/*
|--------------------------------------------------------------------------
| TOURISM INFORMATION
|--------------------------------------------------------------------------
*/


attractions:[

{
    type:String,
    trim:true
}

],


activities:[

{
    type:String,
    trim:true
}

],


languages:[

{
    type:String,
    trim:true
}

],


currency:{
    type:String,
    default:""
},


timezone:{
    type:String,
    default:""
},




/*
|--------------------------------------------------------------------------
| WEATHER
|--------------------------------------------------------------------------
*/


bestSeason:{

type:String,

enum:[

"Spring",
"Summer",
"Autumn",
"Winter",
"All Year"

],

default:"All Year"

},


weather:{
    type:String,
    default:""
},


averageTemperature:{
    type:Number,
    default:null
},




/*
|--------------------------------------------------------------------------
| LOCATION
|--------------------------------------------------------------------------
*/


coordinates:{

latitude:{
    type:Number,
    min:-90,
    max:90
},


longitude:{
    type:Number,
    min:-180,
    max:180
}

},




/*
|--------------------------------------------------------------------------
| POPULARITY
|--------------------------------------------------------------------------
*/


averageRating:{

type:Number,

default:0,

min:0,

max:5

},


totalReviews:{
    type:Number,
    default:0
},


totalTours:{
    type:Number,
    default:0
},


totalBookings:{
    type:Number,
    default:0
},




/*
|--------------------------------------------------------------------------
| FEATURES
|--------------------------------------------------------------------------
*/


featured:{

type:Boolean,

default:false

},


popular:{

type:Boolean,

default:false

},




/*
|--------------------------------------------------------------------------
| STATUS
|--------------------------------------------------------------------------
*/


status:{

type:String,

enum:[

"active",
"inactive"

],

default:"active"

},



// compatibility with second schema

active:{

type:Boolean,

default:true

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


seo:{

title:{
    type:String,
    default:""
},


description:{
    type:String,
    default:""
},


keywords:[

{
    type:String,
    trim:true
}

]

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
| AUTO SLUG GENERATION
|--------------------------------------------------------------------------
*/


destinationSchema.pre("save",function(next){


if(!this.slug && this.name){

this.slug = slugify(this.name,{

lower:true,

strict:true,

trim:true

});

}


next();


});





/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/


destinationSchema.virtual("location")
.get(function(){


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


destinationSchema.index({
slug:1
});


destinationSchema.index({
country:1
});


destinationSchema.index({
region:1
});


destinationSchema.index({
city:1
});


destinationSchema.index({
featured:1
});


destinationSchema.index({
popular:1
});


destinationSchema.index({
status:1
});


destinationSchema.index({
active:1
});


destinationSchema.index({
averageRating:-1
});


destinationSchema.index({
totalBookings:-1
});


destinationSchema.index({
isDeleted:1
});






/*
|--------------------------------------------------------------------------
| METHODS
|--------------------------------------------------------------------------
*/


destinationSchema.methods.updateRating=function(rating){

this.averageRating = rating;

return this.save();

};






/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/


const Destination =

mongoose.models.Destination ||

mongoose.model(
"Destination",
destinationSchema
);


export default Destination;
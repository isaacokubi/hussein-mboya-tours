import mongoose from "mongoose";


const reviewSchema =
new mongoose.Schema(

{

  // Customer/User who wrote the review
  user:{

    type:
    mongoose.Schema.Types.ObjectId,

    ref:"User",

    required:true

  },


  // Optional alias for older code compatibility
  customer:{

    type:
    mongoose.Schema.Types.ObjectId,

    ref:"User"

  },



  tour:{

    type:
    mongoose.Schema.Types.ObjectId,

    ref:"Tour",

    required:true

  },



  booking:{

    type:
    mongoose.Schema.Types.ObjectId,

    ref:"Booking",

    required:true

  },



  rating:{

    type:Number,

    required:true,

    min:1,

    max:5

  },



  title:{

    type:String,

    trim:true

  },



  comment:{

    type:String,

    required:true,

    trim:true

  },



  images:[

    String

  ],



  verified:{

    type:Boolean,

    default:false

  },



  approved:{

    type:Boolean,

    default:false

  },



  helpfulVotes:{

    type:Number,

    default:0

  }


},

{

  timestamps:true

}

);





export default mongoose.models.Review ||

mongoose.model(
  "Review",
  reviewSchema
);
import mongoose from "mongoose";


const heroSlideSchema = new mongoose.Schema(

{

title:{
    type:String,
    required:true,
    trim:true
},


subtitle:{
    type:String,
    default:""
},


video:{
    url:String,

    publicId:String
},


image:{
    url:String,

    publicId:String
},


badge:{
    type:String,

    default:"Discover Africa"
},


buttonOne:{
    text:{
        type:String,
        default:"Explore Tours"
    },

    link:{
        type:String,
        default:"/tours"
    }
},


buttonTwo:{
    text:{
        type:String,
        default:"Book Now"
    },

    link:{
        type:String,
        default:"/contact"
    }
},


active:{
    type:Boolean,
    default:true
},


order:{
    type:Number,
    default:0
}


},

{
timestamps:true
}


);



export default mongoose.model(
"HeroSlide",
heroSlideSchema
);
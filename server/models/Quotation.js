import mongoose from "mongoose";


const quotationSchema =
new mongoose.Schema({

agent:{
type:mongoose.Schema.Types.ObjectId,
ref:"Agent",
required:true
},


customer:{
type:mongoose.Schema.Types.ObjectId,
ref:"Customer",
required:true
},


tourPackage:{
type:mongoose.Schema.Types.ObjectId,
ref:"TourPackage"
},


items:[

{

name:{
type:String,
required:true
},


category:{
type:String,
enum:[
"Accommodation",
"Transport",
"Activity",
"Meal",
"Other"
]
},


quantity:{
type:Number,
default:1
},


unitPrice:{
type:Number,
required:true
},


total:{
type:Number,
required:true
}

}

],



subtotal:{
type:Number,
default:0
},


tax:{
type:Number,
default:0
},


discount:{
type:Number,
default:0
},


grandTotal:{
type:Number,
default:0
},


currency:{
type:String,
default:"KES"
},


status:{

type:String,

enum:[

"draft",

"sent",

"approved",

"rejected",

"converted"

],

default:"draft"

},


notes:String,


validUntil:Date


},

{
timestamps:true
});


export default mongoose.model(
"Quotation",
quotationSchema
);
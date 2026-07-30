import mongoose from "mongoose";


const destinationSchema =
new mongoose.Schema(
{

name:{
type:String,
required:true,
trim:true
},


slug:{
type:String,
unique:true,
lowercase:true
},


country:{
type:String,
required:true
},


description:{
type:String,
required:true
},


images:[
String
],


attractions:[

String

],


activities:[

String

],


bestSeason:{
type:String
},


weather:{
type:String
},


coordinates:{

latitude:Number,

longitude:Number

},


featured:{
type:Boolean,
default:false
},


seo:{

title:String,

description:String,

keywords:[String]

}


},
{
timestamps:true
}

);



export default mongoose.model(
"Destination",
destinationSchema
);
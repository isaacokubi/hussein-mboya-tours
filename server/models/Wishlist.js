import mongoose from "mongoose";


const wishlistSchema =
new mongoose.Schema(
{

user:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true,
unique:true
},


tours:[

{
type:mongoose.Schema.Types.ObjectId,
ref:"Tour"
}

]

},
{
timestamps:true
}

);


export default mongoose.model(
"Wishlist",
wishlistSchema
);
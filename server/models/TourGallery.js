import mongoose from "mongoose";


const gallerySchema =
new mongoose.Schema({

tour:{
type:mongoose.Schema.Types.ObjectId,
ref:"Tour"
},


images:[String]


},
{
timestamps:true
});


export default mongoose.model(
"TourGallery",
gallerySchema
);
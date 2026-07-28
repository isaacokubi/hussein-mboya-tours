import mongoose from "mongoose";


const vehicleSchema = new mongoose.Schema(

{


// Vehicle display name

name:{

type:String,

required:true,

trim:true

},




// Registration details

registrationNumber:{

type:String,

required:true,

unique:true,

uppercase:true,

trim:true

},


// Backward compatibility

registration:{

type:String,

trim:true

},





// Vehicle model

model:{

type:String,

required:true,

trim:true

},





// Vehicle category

type:{

type:String,

enum:[

"SUV",

"VAN",

"BUS",

"Land Cruiser"

],

required:true

},





// Number of passengers

capacity:{

type:Number,

required:true,

min:1

},





// Assigned driver

driver:{

type:mongoose.Schema.Types.ObjectId,

ref:"Staff",

default:null

},





// Vehicle operational status

status:{


type:String,


enum:[

"Available",

"Assigned",

"Maintenance"

],


default:"Available"

},





// Cloudinary image storage

image:{


url:{

type:String

},


publicId:{

type:String

}

},





// Additional notes

description:{

type:String

},




isActive:{


type:Boolean,


default:true

}



},


{

timestamps:true

}

);





// Indexes for faster searches

vehicleSchema.index({

registrationNumber:1

});


vehicleSchema.index({

status:1

});


vehicleSchema.index({

type:1

});





export default mongoose.model(

"Vehicle",

vehicleSchema

);
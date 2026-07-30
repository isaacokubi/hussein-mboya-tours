import mongoose from "mongoose";


const staffSchema = new mongoose.Schema(

{

name:{

type:String,

required:true,

trim:true

},



email:{

type:String,

unique:true,

lowercase:true,

trim:true

},



phone:{

type:String,

required:true,

trim:true

},




// Staff Position / Role

position:{

type:String,

enum:[

"admin",

"tour_manager",

"guide",

"driver",

"support"

],

required:true

},





// Backward compatibility with old role field

role:{

type:String,

enum:[

"admin",

"manager",

"guide",

"driver",

"support"

]

},





profileImage:{

url:{

type:String

},

publicId:{

type:String

}

},






// Driver information

licenseNumber:{

type:String

},






languages:[

{

type:String

}

],





experience:{

type:Number,

default:0

},






// Current work availability

availability:{


type:String,


enum:[

"available",

"busy",

"leave"

],


default:"available"

},






// Assigned tours

assignedTours:[

{

type:mongoose.Schema.Types.ObjectId,

ref:"Tour"

}

],






// Employee status

status:{


type:String,


enum:[

"active",

"inactive"

],


default:"active"

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




// Indexes for faster admin searches

staffSchema.index({

email:1

});


staffSchema.index({

position:1

});


staffSchema.index({

status:1

});



export default mongoose.model(

"Staff",

staffSchema

);
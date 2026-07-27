import mongoose from "mongoose";


const preferenceSchema =
new mongoose.Schema(
{

user:{

type:mongoose.Schema.Types.ObjectId,

ref:"User"

},


interests:[

String

],


preferredCountries:[

String

],


budgetRange:{

min:Number,

max:Number

},


travelStyle:[

String

]


},
{
timestamps:true
}

);



export default mongoose.model(
"UserPreference",
preferenceSchema
);
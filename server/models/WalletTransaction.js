import mongoose from "mongoose";


const walletTransactionSchema =
new mongoose.Schema(
{

agent:{

type:mongoose.Schema.Types.ObjectId,

ref:"User"

},


type:{

type:String,

enum:[

"commission",

"withdrawal"

]

},


amount:Number,


reference:String,


status:{

type:String,

default:"completed"

}


},
{
timestamps:true
}

);


export default mongoose.model(
"WalletTransaction",
walletTransactionSchema
);
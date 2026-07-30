import mongoose from "mongoose";


const currencySchema =
new mongoose.Schema({

code:String,

symbol:String,

rate:Number

});


export default mongoose.model(
"Currency",
currencySchema
);
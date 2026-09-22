
import * as firestore from "../config/firestore.js";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";


const refundAuditSchema =
new firestore.Schema({

    tenantId:{
        type: firestore.Schema.Types.ObjectId,
        ref:"Organization",
        index:true,
        required:false
    },

payment:{
type:firestore.Schema.Types.ObjectId,
ref:"Payment",
required:true,
index:true
},


booking:{
type:firestore.Schema.Types.ObjectId,
ref:"Booking",
default:null
},


amount:{
type:Number,
required:true
},


status:{
type:String,
enum:[
"processing",
"completed",
"failed"
],
default:"processing"
},


reference:{
type:String,
default:""
},


requestedBy:{
type:firestore.Schema.Types.ObjectId,
ref:"User",
default:null
},


completedAt:{
type:Date,
default:null
}


},{
timestamps:true
});









export default refundAuditSchema.plugin(tenantPlugin);

firestore.model(
"RefundAudit",
refundAuditSchema
);

import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

const databaseBackupSchema = new mongoose.Schema(
{

    tenantId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Organization",
        index:true,
        required:false
    },
  file:{
    type:String,
    required:true
  },

  size:{
    type:String,
    default:"0 MB"
  },

  collections:{
    type:[String],
    default:[]
  },

  databaseName:{
    type:String,
    default:"unknown"
  },

  environment:{
    type:String,
    default:"production"
  },

  createdBy:{
    type:String,
    default:"system"
  }

},
{
  timestamps:true
});









export default databaseBackupSchema.plugin(tenantPlugin);

mongoose.model(
"DatabaseBackup",
databaseBackupSchema
);
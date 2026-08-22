import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const databaseBackupSchema = new mongoose.Schema(
{
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

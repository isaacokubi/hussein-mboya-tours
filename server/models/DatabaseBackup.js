/**
 * Purpose: Database Backup database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

// Declare databaseBackupSchema for use by the surrounding module or function.
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









// Perform the side effect or state update expressed on the following line.
databaseBackupSchema.plugin(tenantPlugin);

// Declare DatabaseBackup for use by the surrounding module or function.
const DatabaseBackup = mongoose.models.DatabaseBackup || mongoose.model("DatabaseBackup", databaseBackupSchema);

export default DatabaseBackup;

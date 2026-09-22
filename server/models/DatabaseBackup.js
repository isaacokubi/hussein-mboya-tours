import * as firestore from "../config/firestore.js";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

const databaseBackupSchema = new firestore.Schema(
{

    tenantId:{
        type: firestore.Schema.Types.ObjectId,
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

firestore.model(
"DatabaseBackup",
databaseBackupSchema
);

import mongoose from "mongoose";

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

  createdBy:{
    type:String,
    default:"system"
  },

  createdAt:{
    type:Date,
    default:Date.now
  }

},
{
 timestamps:true
}
);

export default mongoose.model(
"DatabaseBackup",
databaseBackupSchema
);

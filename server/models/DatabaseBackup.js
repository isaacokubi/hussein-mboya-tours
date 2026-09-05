import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

const databaseBackupSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      index: true,
      required: false,
    },
    file: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      default: "0 MB",
    },
    collections: {
      type: [String],
      default: [],
    },
    databaseName: {
      type: String,
      default: "unknown",
    },
    environment: {
      type: String,
      default: "production",
    },
    createdBy: {
      type: String,
      default: "system",
    },
  },
  {
    timestamps: true,
  },
);

databaseBackupSchema.plugin(tenantPlugin);
databaseBackupSchema.plugin(tenantAggregationPlugin);

// Export the actual Mongoose model. The previous code exported the schema
// while controllers called DatabaseBackup.create/find/delete, so backup
// creation failed before a backup record could be stored.
const DatabaseBackup = mongoose.models.DatabaseBackup || mongoose.model("DatabaseBackup", databaseBackupSchema);

export default DatabaseBackup;

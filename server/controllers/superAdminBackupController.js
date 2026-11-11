/**
 * Purpose: super Admin Backup Controller HTTP controller. Main declarations: serializeBackup, createPlatformDatabaseBackup, listPlatformDatabaseBackups, downloadPlatformDatabaseBackup, deletePlatformDatabaseBackup.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { publicErrorMessage } from "../utils/publicError.js";
// Load fs so this module can use its exported dependencies.
import fs from "fs";
// Load path so this module can use its exported dependencies.
import path from "path";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../models/DatabaseBackup.js so this module can use its exported dependencies.
import DatabaseBackup from "../models/DatabaseBackup.js";
// Load ../services/auditService.js so this module can use its exported dependencies.
import { createAuditLog } from "../services/auditService.js";

// Declare BACKUP_DIR for use by the surrounding module or function.
const BACKUP_DIR = path.join(process.cwd(), "server", "backups");
// Declare PLATFORM_BACKUP_FILTER for use by the surrounding module or function.
const PLATFORM_BACKUP_FILTER = { tenantId: null };

// Declare serializeBackup for use by the surrounding module or function.
const serializeBackup = (backup) => {
  // Check the condition (!backup) and run the matching branch.
  if (!backup) return null;
  // Return the expression shown below to the caller.
  return typeof backup.toObject === "function" ? backup.toObject() : backup;
};

// Declare createPlatformDatabaseBackup for use by the surrounding module or function.
export const createPlatformDatabaseBackup = async (req, res) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!mongoose.connection.db) and run the matching branch.
    if (!mongoose.connection.db) {
      // Return the result of res.status(503).json() to the caller.
      return res.status(503).json({ success: false, message: "Database connection unavailable" });
    }

    // Perform the side effect or state update expressed on the following line.
    fs.mkdirSync(BACKUP_DIR, { recursive: true });

    // Declare filename for use by the surrounding module or function.
    const filename = `database-backup-${Date.now()}.json`;
    // Declare filepath for use by the surrounding module or function.
    const filepath = path.join(BACKUP_DIR, filename);
    // Declare collections for use by the surrounding module or function.
    const collections = await mongoose.connection.db.listCollections().toArray();
    // Declare backupData for use by the surrounding module or function.
    const backupData = {
      createdAt: new Date(),
      environment: process.env.NODE_ENV || "production",
      database: mongoose.connection.name || "unknown",
      scope: "platform",
      tenantId: null,
      createdBy: req.user?.email || String(req.user?._id || "system"),
    };

    // Repeat the enclosed work for each required iteration.
    for (const collection of collections) {
      // Perform the side effect or state update expressed on the following line.
      backupData[collection.name] = await mongoose.connection.db
        .collection(collection.name)
        .find({})
        .toArray();
    }

    // Perform the side effect or state update expressed on the following line.
    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
    // Declare fileSize for use by the surrounding module or function.
    const fileSize = `${(fs.statSync(filepath).size / 1024 / 1024).toFixed(2)} MB`;

    // Use the native collection for platform-owned records so tenant middleware
    // cannot accidentally reject a legitimate platform-scoped backup.
    // Declare result for use by the surrounding module or function.
    const result = await DatabaseBackup.collection.insertOne({
      tenantId: null,
      file: filename,
      size: fileSize,
      collections: collections.map((item) => item.name),
      databaseName: mongoose.connection.name || "unknown",
      environment: process.env.NODE_ENV || "production",
      createdBy: req.user?.email || String(req.user?._id || "system"),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Declare backup for use by the surrounding module or function.
    const backup = await DatabaseBackup.collection.findOne({ _id: result.insertedId });

    // Perform the side effect or state update expressed on the following line.
    await createAuditLog({
      user: req.user?._id,
      action: "create",
      resource: "Database",
      description: `Platform database backup created: ${filename}`,
      status: "success",
      severity: "low",
    });

    // Return the result of res.json() to the caller.
    return res.json({
      success: true,
      message: "Platform database backup created successfully",
      file: filename,
      backup: serializeBackup(backup),
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("PLATFORM BACKUP ERROR", error);
    // Return the result of res.status(500).json() to the caller.
    return res.status(500).json({ success: false, message: publicErrorMessage(error) });
  }
};

// Declare listPlatformDatabaseBackups for use by the surrounding module or function.
export const listPlatformDatabaseBackups = async (req, res) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare backups for use by the surrounding module or function.
    const backups = await DatabaseBackup.collection
      .find(PLATFORM_BACKUP_FILTER)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // Return the result of res.json() to the caller.
    return res.json({
      success: true,
      backups: backups.map(serializeBackup),
      count: backups.length,
      scope: "platform",
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("PLATFORM BACKUP LIST ERROR", error);
    // Return the result of res.status(500).json() to the caller.
    return res.status(500).json({ success: false, message: "Unable to read platform backup records" });
  }
};

// Declare downloadPlatformDatabaseBackup for use by the surrounding module or function.
export const downloadPlatformDatabaseBackup = async (req, res) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Invalid backup identifier" });
    }

    // Declare backup for use by the surrounding module or function.
    const backup = await DatabaseBackup.collection.findOne({
      _id: new mongoose.Types.ObjectId(req.params.id),
      ...PLATFORM_BACKUP_FILTER,
    });

    // Check the condition (!backup) and run the matching branch.
    if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });

    // Declare filepath for use by the surrounding module or function.
    const filepath = path.join(BACKUP_DIR, path.basename(backup.file));
    // Check the condition (!fs.existsSync(filepath)) and run the matching branch.
    if (!fs.existsSync(filepath)) return res.status(404).json({ success: false, message: "Backup file missing" });

    // Return the result of res.download() to the caller.
    return res.download(filepath, path.basename(backup.file));
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("PLATFORM BACKUP DOWNLOAD ERROR", error);
    // Return the result of res.status(500).json() to the caller.
    return res.status(500).json({ success: false, message: "Unable to download the selected backup" });
  }
};

// Declare deletePlatformDatabaseBackup for use by the surrounding module or function.
export const deletePlatformDatabaseBackup = async (req, res) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ success: false, message: "Invalid backup identifier" });
    }

    // Declare backup for use by the surrounding module or function.
    const backup = await DatabaseBackup.collection.findOne({
      _id: new mongoose.Types.ObjectId(req.params.id),
      ...PLATFORM_BACKUP_FILTER,
    });

    // Check the condition (!backup) and run the matching branch.
    if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });

    // Declare filepath for use by the surrounding module or function.
    const filepath = path.join(BACKUP_DIR, path.basename(backup.file));
    // Check the condition (fs.existsSync(filepath)) and run the matching branch.
    if (fs.existsSync(filepath)) fs.rmSync(filepath, { force: true });

    // Perform the side effect or state update expressed on the following line.
    await DatabaseBackup.collection.deleteOne({
      _id: backup._id,
      ...PLATFORM_BACKUP_FILTER,
    });

    // Perform the side effect or state update expressed on the following line.
    await createAuditLog({
      user: req.user?._id,
      action: "delete",
      resource: "Database",
      description: `Platform database backup deleted: ${backup.file}`,
      status: "success",
      severity: "medium",
    });

    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: "Backup deleted successfully" });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("PLATFORM BACKUP DELETE ERROR", error);
    // Return the result of res.status(500).json() to the caller.
    return res.status(500).json({ success: false, message: "Unable to delete the selected backup" });
  }
};

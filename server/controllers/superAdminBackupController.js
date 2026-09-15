import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import DatabaseBackup from "../models/DatabaseBackup.js";
import { createAuditLog } from "../services/auditService.js";

const BACKUP_DIR = path.join(process.cwd(), "server", "backups");
const PLATFORM_BACKUP_FILTER = { tenantId: null };

const serializeBackup = (backup) => {
  if (!backup) return null;
  return typeof backup.toObject === "function" ? backup.toObject() : backup;
};

export const createPlatformDatabaseBackup = async (req, res) => {
  try {
    if (!mongoose.connection.db) {
      return res.status(503).json({ success: false, message: "Database connection unavailable" });
    }

    fs.mkdirSync(BACKUP_DIR, { recursive: true });

    const filename = `database-backup-${Date.now()}.json`;
    const filepath = path.join(BACKUP_DIR, filename);
    const collections = await mongoose.connection.db.listCollections().toArray();
    const backupData = {
      createdAt: new Date(),
      environment: process.env.NODE_ENV || "production",
      database: mongoose.connection.name || "unknown",
      scope: "platform",
      tenantId: null,
      createdBy: req.user?.email || String(req.user?._id || "system"),
    };

    for (const collection of collections) {
      backupData[collection.name] = await mongoose.connection.db
        .collection(collection.name)
        .find({})
        .toArray();
    }

    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
    const fileSize = `${(fs.statSync(filepath).size / 1024 / 1024).toFixed(2)} MB`;

    // Use the native collection for platform-owned records so tenant middleware
    // cannot accidentally reject a legitimate platform-scoped backup.
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

    const backup = await DatabaseBackup.collection.findOne({ _id: result.insertedId });

    await createAuditLog({
      user: req.user?._id,
      action: "create",
      resource: "Database",
      description: `Platform database backup created: ${filename}`,
      status: "success",
      severity: "low",
    });

    return res.json({
      success: true,
      message: "Platform database backup created successfully",
      file: filename,
      backup: serializeBackup(backup),
    });
  } catch (error) {
    console.error("PLATFORM BACKUP ERROR", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const listPlatformDatabaseBackups = async (req, res) => {
  try {
    const backups = await DatabaseBackup.collection
      .find(PLATFORM_BACKUP_FILTER)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return res.json({
      success: true,
      backups: backups.map(serializeBackup),
      count: backups.length,
      scope: "platform",
    });
  } catch (error) {
    console.error("PLATFORM BACKUP LIST ERROR", error);
    return res.status(500).json({ success: false, message: "Unable to read platform backup records" });
  }
};

export const downloadPlatformDatabaseBackup = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid backup identifier" });
    }

    const backup = await DatabaseBackup.collection.findOne({
      _id: new mongoose.Types.ObjectId(req.params.id),
      ...PLATFORM_BACKUP_FILTER,
    });

    if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });

    const filepath = path.join(BACKUP_DIR, path.basename(backup.file));
    if (!fs.existsSync(filepath)) return res.status(404).json({ success: false, message: "Backup file missing" });

    return res.download(filepath, path.basename(backup.file));
  } catch (error) {
    console.error("PLATFORM BACKUP DOWNLOAD ERROR", error);
    return res.status(500).json({ success: false, message: "Unable to download the selected backup" });
  }
};

export const deletePlatformDatabaseBackup = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid backup identifier" });
    }

    const backup = await DatabaseBackup.collection.findOne({
      _id: new mongoose.Types.ObjectId(req.params.id),
      ...PLATFORM_BACKUP_FILTER,
    });

    if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });

    const filepath = path.join(BACKUP_DIR, path.basename(backup.file));
    if (fs.existsSync(filepath)) fs.rmSync(filepath, { force: true });

    await DatabaseBackup.collection.deleteOne({
      _id: backup._id,
      ...PLATFORM_BACKUP_FILTER,
    });

    await createAuditLog({
      user: req.user?._id,
      action: "delete",
      resource: "Database",
      description: `Platform database backup deleted: ${backup.file}`,
      status: "success",
      severity: "medium",
    });

    return res.json({ success: true, message: "Backup deleted successfully" });
  } catch (error) {
    console.error("PLATFORM BACKUP DELETE ERROR", error);
    return res.status(500).json({ success: false, message: "Unable to delete the selected backup" });
  }
};

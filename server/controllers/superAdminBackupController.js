import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import DatabaseBackup from "../models/DatabaseBackup.js";
import { createAuditLog } from "../services/auditService.js";

const BACKUP_DIR = path.join(process.cwd(), "server", "backups");

export const createPlatformDatabaseBackup = async (req, res) => {
  try {
    if (!mongoose.connection.db) return res.status(503).json({ success: false, message: "Database connection unavailable" });
    fs.mkdirSync(BACKUP_DIR, { recursive: true });

    const filename = `database-backup-${Date.now()}.json`;
    const filepath = path.join(BACKUP_DIR, filename);
    const collections = await mongoose.connection.db.listCollections().toArray();
    const backupData = {
      createdAt: new Date(),
      environment: process.env.NODE_ENV || "production",
      database: mongoose.connection.name || "unknown",
      createdBy: req.user?.email || String(req.user?._id || "system"),
    };

    for (const collection of collections) {
      backupData[collection.name] = await mongoose.connection.db.collection(collection.name).find({}).toArray();
    }

    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
    const fileSize = `${(fs.statSync(filepath).size / 1024 / 1024).toFixed(2)} MB`;
    const backup = await DatabaseBackup.create({
      tenantId: null,
      file: filename,
      size: fileSize,
      collections: collections.map((item) => item.name),
      databaseName: mongoose.connection.name || "unknown",
      environment: process.env.NODE_ENV || "production",
      createdBy: req.user?.email || String(req.user?._id || "system"),
    });

    await createAuditLog({ user: req.user?._id, action: "create", resource: "Database", description: `Platform database backup created: ${filename}`, status: "success", severity: "low" });
    return res.json({ success: true, message: "Platform database backup created successfully", file: filename, backup });
  } catch (error) {
    console.error("PLATFORM BACKUP ERROR", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const listPlatformDatabaseBackups = async (req, res) => {
  try {
    const backups = await DatabaseBackup.find({}).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, backups });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadPlatformDatabaseBackup = async (req, res) => {
  try {
    const backup = await DatabaseBackup.findById(req.params.id).lean();
    if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });
    const filepath = path.join(BACKUP_DIR, path.basename(backup.file));
    if (!fs.existsSync(filepath)) return res.status(404).json({ success: false, message: "Backup file missing" });
    return res.download(filepath, path.basename(backup.file));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePlatformDatabaseBackup = async (req, res) => {
  try {
    const backup = await DatabaseBackup.findById(req.params.id).lean();
    if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });
    const filepath = path.join(BACKUP_DIR, path.basename(backup.file));
    if (fs.existsSync(filepath)) fs.rmSync(filepath, { force: true });
    await DatabaseBackup.deleteOne({ _id: backup._id });
    return res.json({ success: true, message: "Backup deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

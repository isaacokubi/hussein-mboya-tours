import { tenantFilter } from "../tenancy/tenantQuery.js";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const BACKUP_DIR = path.join(process.cwd(), "server", "backups");

import mongoose from "mongoose";
import DatabaseBackup from "../models/DatabaseBackup.js";
import AuditLog from "../models/AuditLog.js";
import User from "../models/User.js";
import { createAuditLog } from "../services/auditService.js";

export const getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      search = "",
      action = "",
      resource = "",
      status = "",
      severity = "",
    } = req.query;

    const filter = {};

    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (status) filter.status = status;
    if (severity) filter.severity = severity;

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: "i" } },
        { resource: { $regex: search, $options: "i" } },
        { action: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total, success, failed, critical] = await Promise.all([
      AuditLog.find(filter)
        .populate("user", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      AuditLog.countDocuments(filter),
      AuditLog.countDocuments({ status: "success" }),
      AuditLog.countDocuments({ status: "failed" }),
      AuditLog.countDocuments({ severity: "critical" }),
    ]);

    res.json({
      success: true,
      statistics: { total, success, failed, critical },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
      logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSecurityStatus = async (req, res) => {
  try {
    const securityService = await import("../services/securityService.js");
    const data = await securityService.default.getSecurityStatus();

    await createAuditLog({
      user: req.user?._id,
      action: "view",
      resource: "Security",
      description: "Viewed security center status",
      severity: "low",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      endpoint: req.originalUrl,
      method: req.method,
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDatabaseStatus = async (req, res) => {
  try {
    const state = mongoose.connection.readyState;

    res.json({
      success: true,
      database: {
        status: state === 1 ? "Connected" : "Disconnected",
        connected: state === 1,
        host: mongoose.connection.host || "Unknown",
        name: mongoose.connection.name || "Unknown",
        environment: process.env.NODE_ENV || "production",
        checkedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("DATABASE STATUS ERROR", error);
    res.status(500).json({
      success: false,
      message: "Unable to read database status",
    });
  }
};

/**
 * Return a stable, frontend-friendly system health contract.
 * Values are calculated directly from the running Node/Express process so
 * the Super Admin console does not have to infer them from unrelated APIs.
 */
export const getSystemHealth = async (req, res) => {
  try {
    const memory = process.memoryUsage();
    const databaseState = mongoose.connection.readyState;
    const timestamp = new Date();

    const usedMb = Math.round((memory.rss / 1024 / 1024) * 100) / 100;
    const totalMb = Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100;

    const system = {
      status: "healthy",
      uptime: process.uptime(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || "development",
      memory: {
        used: `${usedMb} MB`,
        total: `${totalMb} MB`,
        rss: memory.rss,
        heapUsed: memory.heapUsed,
        heapTotal: memory.heapTotal,
        external: memory.external,
      },
      platform: {
        os: process.platform,
        architecture: process.arch,
        release: process.release?.name || "node",
      },
      database: databaseState === 1 ? "Connected" : "Disconnected",
      timestamp,
    };

    res.json({
      success: true,
      system,
    });
  } catch (error) {
    console.error("SYSTEM HEALTH ERROR", error);

    res.status(500).json({
      success: false,
      message: "Unable to read system health",
    });
  }
};

export const getApiMonitor = async (req, res) => {
  res.json({
    success: true,
    api: {
      status: "online",
      timestamp: new Date(),
      service: "${companyName} API",
    },
  });
};

export const clearSystemCache = async (req, res) => {
  try {
    const folders = [
      path.join(process.cwd(), "cache"),
      path.join(process.cwd(), "tmp"),
      path.join(process.cwd(), "uploads", "tmp"),
    ];

    const cleared = [];

    for (const folder of folders) {
      if (fs.existsSync(folder)) {
        for (const item of fs.readdirSync(folder)) {
          fs.rmSync(path.join(folder, item), {
            recursive: true,
            force: true,
          });
        }
        cleared.push(folder);
      }
    }

    res.json({
      success: true,
      message: "System cache cleared successfully",
      cleared,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("CACHE CLEAR ERROR", error);

    try {
      await createAuditLog({
        user: req.user?._id,
        action: "error",
        resource: "Database",
        description: error.message,
        status: "failed",
        severity: "high",
      });
    } catch (auditError) {
      console.error(auditError.message);
    }

    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDatabaseBackup = async (req, res) => {
  try {
    if (!mongoose.connection.db) {
      return res.status(503).json({
        success: false,
        message: "Database connection unavailable",
      });
    }

    const db = mongoose.connection.db;
    const backupDir = path.join(process.cwd(), "server", "backups");

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const filename = `database-backup-${Date.now()}.json`;
    const filepath = path.join(backupDir, filename);

    const backupData = {
      createdAt: new Date(),
      environment: process.env.NODE_ENV || "production",
      database: mongoose.connection.name || "unknown",
      createdBy: req.user?.email || req.user?._id || "system",
    };

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((collection) => collection.name);

    for (const collection of collections) {
      const name = collection.name;
      backupData[name] = await db.collection(name).find(tenantFilter(req)).toArray();
    }

    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));

    await DatabaseBackup.create({
      file: filename,
      size: `${(fs.statSync(filepath).size / 1024 / 1024).toFixed(2)} MB`,
      collections: collectionNames,
      databaseName: mongoose.connection.name || "unknown",
      environment: process.env.NODE_ENV || "production",
      createdBy: req.user?.email || req.user?._id || "system",
    });

    await createAuditLog({
      user: req.user?._id,
      action: "create",
      resource: "Database",
      description: `Database backup created: ${filename}`,
      status: "success",
      severity: "low",
    });

    res.json({
      success: true,
      message: "Database backup created successfully",
      file: filename,
    });
  } catch (error) {
    console.error("BACKUP ERROR DETAILS:", error.message, error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listDatabaseBackups = async (req, res) => {
  try {
    const backups = await DatabaseBackup.find(tenantFilter(req)).sort({ createdAt: -1 }).lean();
    res.json({ success: true, backups });
  } catch (error) {
    console.error("LIST BACKUPS ERROR", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadDatabaseBackup = async (req, res) => {
  try {
    const backup = await DatabaseBackup.findById(req.params.id);

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: "Backup not found",
      });
    }

    const filepath = path.join(
      process.cwd(),
      "server",
      "backups",
      backup.file,
    );

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        message: "Backup file missing",
      });
    }

    res.download(filepath);
  } catch (error) {
    await createAuditLog({
      user: req.user?._id,
      action: "error",
      resource: "Database",
      description: error.message,
      status: "failed",
      severity: "high",
    });

    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDatabaseBackup = async (req, res) => {
  try {
    const backup = await DatabaseBackup.findById(req.params.id);

    if (!backup) {
      return res.status(404).json({
        success: false,
        message: "Backup not found",
      });
    }

    const filepath = path.join(
      process.cwd(),
      "server",
      "backups",
      backup.file,
    );

    if (fs.existsSync(filepath)) {
      fs.rmSync(filepath);
    }

    await DatabaseBackup.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Backup deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

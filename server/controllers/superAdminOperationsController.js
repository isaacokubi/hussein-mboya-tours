import { mergeTenantFilter } from "../tenancy/context.js";
import { isTenantBypassed } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import DatabaseBackup from "../models/DatabaseBackup.js";
import AuditLog from "../models/AuditLog.js";
import User from "../models/User.js";
import { createAuditLog } from "../services/auditService.js";

const BACKUP_DIR = path.join(process.cwd(), "server", "backups");
const AUDIT_PAGE_SIZE = 10;

const backupFilter = (req) => (isTenantBypassed() ? {} : tenantFilter(req));

const backupCollectionFilter = (req) => (isTenantBypassed() ? {} : tenantFilter(req));

export const getAuditLogs = async (req, res) => { try { const { page = 1, search = "", action = "", resource = "", status = "", severity = "" } = req.query; const currentPage = Math.max(Number(page) || 1, 1); const limit = AUDIT_PAGE_SIZE; const filter = {}; if (action) filter.action = action; if (resource) filter.resource = resource; if (status) filter.status = status; if (severity) filter.severity = severity; if (search) filter.$or = [{ description: { $regex: search, $options: "i" } }, { resource: { $regex: search, $options: "i" } }, { action: { $regex: search, $options: "i" } }]; const skip = (currentPage - 1) * limit; const [logs, total, success, failed, critical] = await Promise.all([AuditLog.find(filter).populate("user", "name email role").sort({ createdAt: -1 }).skip(skip).limit(limit), AuditLog.countDocuments(filter), AuditLog.countDocuments({ status: "success" }), AuditLog.countDocuments({ status: "failed" }), AuditLog.countDocuments({ severity: "critical" })]); return res.json({ success: true, statistics: { total, success, failed, critical }, pagination: { page: currentPage, limit, pages: Math.max(1, Math.ceil(total / limit)) }, logs }); } catch (error) { res.status(500).json({ success: false, message: error.message }); } };

export const getSecurityStatus = async (req, res) => { try { const securityService = await import("../services/securityService.js"); const data = await securityService.default.getSecurityStatus(); await createAuditLog({ user: req.user?._id, action: "view", resource: "Security", description: "Viewed security center status", severity: "low", ipAddress: req.ip, userAgent: req.headers["user-agent"], endpoint: req.originalUrl, method: req.method }); res.json({ success: true, data }); } catch (error) { res.status(500).json({ success: false, message: error.message }); } };
export const getDatabaseStatus = async (req, res) => { try { const state = mongoose.connection.readyState; res.json({ success: true, database: { status: state === 1 ? "Connected" : "Disconnected", connected: state === 1, host: mongoose.connection.host || "Unknown", name: mongoose.connection.name || "Unknown", environment: process.env.NODE_ENV || "production", checkedAt: new Date() } }); } catch (error) { console.error("DATABASE STATUS ERROR", error); res.status(500).json({ success: false, message: "Unable to read database status" }); } };

export const getSystemHealth = async (req, res) => {
  try {
    const memory = process.memoryUsage();
    const databaseState = mongoose.connection.readyState;
    const databaseConnected = databaseState === 1;
    const timestamp = new Date();
    const rssMb = Math.round((memory.rss / 1024 / 1024) * 100) / 100;
    const heapUsedMb = Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100;
    const heapTotalMb = Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100;
    const externalMb = Math.round((memory.external / 1024 / 1024) * 100) / 100;
    const heapPercent = heapTotalMb > 0 ? Math.round((heapUsedMb / heapTotalMb) * 10000) / 100 : null;
    const status = databaseConnected ? "healthy" : "degraded";

    res.json({
      success: true,
      system: {
        status,
        checks: {
          database: databaseConnected ? "healthy" : "unhealthy",
          runtime: "healthy",
          memory: heapPercent === null || heapPercent < 90 ? "healthy" : "warning",
        },
        uptimeSeconds: Math.round(process.uptime()),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || "development",
        memory: { rssMb, heapUsedMb, heapTotalMb, externalMb, heapPercent },
        platform: { os: process.platform, architecture: process.arch, release: process.release?.name || "node" },
        database: { status: databaseConnected ? "Connected" : "Disconnected", connected: databaseConnected, readyState: databaseState },
        timestamp,
      },
    });
  } catch (error) {
    console.error("SYSTEM HEALTH ERROR", error);
    res.status(500).json({ success: false, message: "Unable to read system health" });
  }
};

export const getApiMonitor = async (req, res) => { res.json({ success: true, api: { status: "online", timestamp: new Date(), service: "Global Tours API" } }); };
export const clearSystemCache = async (req, res) => { try { const folders = [path.join(process.cwd(), "cache"), path.join(process.cwd(), "tmp"), path.join(process.cwd(), "uploads", "tmp")]; const cleared = []; for (const folder of folders) if (fs.existsSync(folder)) { for (const item of fs.readdirSync(folder)) fs.rmSync(path.join(folder, item), { recursive: true, force: true }); cleared.push(folder); } res.json({ success: true, message: "System cache cleared successfully", cleared, timestamp: new Date() }); } catch (error) { try { await createAuditLog({ user: req.user?._id, action: "error", resource: "Database", description: error.message, status: "failed", severity: "high" }); } catch {} res.status(500).json({ success: false, message: error.message }); } };

export const createDatabaseBackup = async (req, res) => {
  try {
    if (!mongoose.connection.db) return res.status(503).json({ success: false, message: "Database connection unavailable" });
    const db = mongoose.connection.db;
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

    const filename = `database-backup-${Date.now()}.json`;
    const filepath = path.join(BACKUP_DIR, filename);
    const platformBackup = isTenantBypassed();
    const backupData = {
      createdAt: new Date(),
      environment: process.env.NODE_ENV || "production",
      database: mongoose.connection.name || "unknown",
      scope: platformBackup ? "platform" : "tenant",
      tenantId: platformBackup ? null : (req.tenantId || null),
      createdBy: req.user?.email || req.user?._id || "system",
    };

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((collection) => collection.name);

    for (const collection of collections) {
      backupData[collection.name] = await db
        .collection(collection.name)
        .find(backupCollectionFilter(req))
        .toArray();
    }

    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));

    await DatabaseBackup.create({
      file: filename,
      size: `${(fs.statSync(filepath).size / 1024 / 1024).toFixed(2)} MB`,
      collections: collectionNames,
      databaseName: mongoose.connection.name || "unknown",
      environment: process.env.NODE_ENV || "production",
      createdBy: req.user?.email || req.user?._id || "system",
      tenantId: platformBackup ? null : (req.tenantId || null),
    });

    await createAuditLog({ user: req.user?._id, action: "create", resource: "Database", description: `Database backup created: ${filename}`, status: "success", severity: "low" });
    res.json({ success: true, message: "Database backup created successfully", file: filename, scope: platformBackup ? "platform" : "tenant" });
  } catch (error) {
    console.error("BACKUP ERROR DETAILS:", error.message, error.stack);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listDatabaseBackups = async (req, res) => {
  try {
    const backups = await DatabaseBackup.find(backupFilter(req)).sort({ createdAt: -1 }).limit(10).lean();
    res.json({ success: true, backups });
  } catch (error) {
    console.error("LIST BACKUPS ERROR", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadDatabaseBackup = async (req, res) => {
  try {
    const backup = await DatabaseBackup.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });
    const filepath = path.join(BACKUP_DIR, backup.file);
    if (!fs.existsSync(filepath)) return res.status(404).json({ success: false, message: "Backup file missing" });
    res.download(filepath);
  } catch (error) {
    await createAuditLog({ user: req.user?._id, action: "error", resource: "Database", description: error.message, status: "failed", severity: "high" });
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDatabaseBackup = async (req, res) => {
  try {
    const backup = await DatabaseBackup.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });
    const filepath = path.join(BACKUP_DIR, backup.file);
    if (fs.existsSync(filepath)) fs.rmSync(filepath);
    await DatabaseBackup.findOneAndDelete(mergeTenantFilter(req, { _id: req.params.id }));
    res.json({ success: true, message: "Backup deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

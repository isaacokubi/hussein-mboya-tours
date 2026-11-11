/**
 * Purpose: super Admin Operations Controller HTTP controller. Main declarations: backupFilter, backupCollectionFilter, getAuditLogs, getSecurityStatus, getDatabaseStatus.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { publicErrorMessage } from "../utils/publicError.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter } from "../tenancy/context.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { isTenantBypassed } from "../tenancy/context.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load fs so this module can use its exported dependencies.
import fs from "fs";
// Load path so this module can use its exported dependencies.
import path from "path";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../models/DatabaseBackup.js so this module can use its exported dependencies.
import DatabaseBackup from "../models/DatabaseBackup.js";
// Load ../models/AuditLog.js so this module can use its exported dependencies.
import AuditLog from "../models/AuditLog.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../services/auditService.js so this module can use its exported dependencies.
import { createAuditLog } from "../services/auditService.js";

// Declare BACKUP_DIR for use by the surrounding module or function.
const BACKUP_DIR = path.join(process.cwd(), "server", "backups");
// Declare AUDIT_PAGE_SIZE for use by the surrounding module or function.
const AUDIT_PAGE_SIZE = 10;

// Declare backupFilter for use by the surrounding module or function.
const backupFilter = (req) => (isTenantBypassed() ? {} : tenantFilter(req));

// Declare backupCollectionFilter for use by the surrounding module or function.
const backupCollectionFilter = (req) => (isTenantBypassed() ? {} : tenantFilter(req));

// Declare getAuditLogs for use by the surrounding module or function.
export const getAuditLogs = async (req, res) => { try { const { page = 1, search = "", action = "", resource = "", status = "", severity = "" } = req.query; const currentPage = Math.max(Number(page) || 1, 1); const limit = AUDIT_PAGE_SIZE; const filter = {}; if (action) filter.action = action; if (resource) filter.resource = resource; if (status) filter.status = status; if (severity) filter.severity = severity; if (search) filter.$or = [{ description: { $regex: search, $options: "i" } }, { resource: { $regex: search, $options: "i" } }, { action: { $regex: search, $options: "i" } }]; const skip = (currentPage - 1) * limit; const [logs, total, success, failed, critical] = await Promise.all([AuditLog.find(filter).populate("user", "name email role").sort({ createdAt: -1 }).skip(skip).limit(limit), AuditLog.countDocuments(filter), AuditLog.countDocuments({ status: "success" }), AuditLog.countDocuments({ status: "failed" }), AuditLog.countDocuments({ severity: "critical" })]); return res.json({ success: true, statistics: { total, success, failed, critical }, pagination: { page: currentPage, limit, pages: Math.max(1, Math.ceil(total / limit)) }, logs }); } catch (error) { res.status(500).json({ success: false, message: publicErrorMessage(error) }); } };

// Declare getSecurityStatus for use by the surrounding module or function.
export const getSecurityStatus = async (req, res) => { try { const securityService = await import("../services/securityService.js"); const data = await securityService.default.getSecurityStatus(); await createAuditLog({ user: req.user?._id, action: "view", resource: "Security", description: "Viewed security center status", severity: "low", ipAddress: req.ip, userAgent: req.headers["user-agent"], endpoint: req.originalUrl, method: req.method }); res.json({ success: true, data }); } catch (error) { res.status(500).json({ success: false, message: publicErrorMessage(error) }); } };
// Declare getDatabaseStatus for use by the surrounding module or function.
export const getDatabaseStatus = async (req, res) => { try { const state = mongoose.connection.readyState; res.json({ success: true, database: { status: state === 1 ? "Connected" : "Disconnected", connected: state === 1, host: mongoose.connection.host || "Unknown", name: mongoose.connection.name || "Unknown", environment: process.env.NODE_ENV || "production", checkedAt: new Date() } }); } catch (error) { console.error("DATABASE STATUS ERROR", error); res.status(500).json({ success: false, message: "Unable to read database status" }); } };

// Declare getSystemHealth for use by the surrounding module or function.
export const getSystemHealth = async (req, res) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare memory for use by the surrounding module or function.
    const memory = process.memoryUsage();
    // Declare databaseState for use by the surrounding module or function.
    const databaseState = mongoose.connection.readyState;
    // Declare databaseConnected for use by the surrounding module or function.
    const databaseConnected = databaseState === 1;
    // Declare timestamp for use by the surrounding module or function.
    const timestamp = new Date();
    // Declare rssMb for use by the surrounding module or function.
    const rssMb = Math.round((memory.rss / 1024 / 1024) * 100) / 100;
    // Declare heapUsedMb for use by the surrounding module or function.
    const heapUsedMb = Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100;
    // Declare heapTotalMb for use by the surrounding module or function.
    const heapTotalMb = Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100;
    // Declare externalMb for use by the surrounding module or function.
    const externalMb = Math.round((memory.external / 1024 / 1024) * 100) / 100;
    // Declare heapPercent for use by the surrounding module or function.
    const heapPercent = heapTotalMb > 0 ? Math.round((heapUsedMb / heapTotalMb) * 10000) / 100 : null;
    // Declare status for use by the surrounding module or function.
    const status = databaseConnected ? "healthy" : "degraded";

    // Perform the side effect or state update expressed on the following line.
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
    // Perform the side effect or state update expressed on the following line.
    console.error("SYSTEM HEALTH ERROR", error);
    // Perform the side effect or state update expressed on the following line.
    res.status(500).json({ success: false, message: "Unable to read system health" });
  }
};

// Declare getApiMonitor for use by the surrounding module or function.
export const getApiMonitor = async (req, res) => { res.json({ success: true, api: { status: "online", timestamp: new Date(), service: "Global Tours API" } }); };
// Declare clearSystemCache for use by the surrounding module or function.
export const clearSystemCache = async (req, res) => { try { const folders = [path.join(process.cwd(), "cache"), path.join(process.cwd(), "tmp"), path.join(process.cwd(), "uploads", "tmp")]; const cleared = []; for (const folder of folders) if (fs.existsSync(folder)) { for (const item of fs.readdirSync(folder)) fs.rmSync(path.join(folder, item), { recursive: true, force: true }); cleared.push(folder); } res.json({ success: true, message: "System cache cleared successfully", cleared, timestamp: new Date() }); } catch (error) { try { await createAuditLog({ user: req.user?._id, action: "error", resource: "Database", description: error.message, status: "failed", severity: "high" }); } catch {} res.status(500).json({ success: false, message: publicErrorMessage(error) }); } };

// Declare createDatabaseBackup for use by the surrounding module or function.
export const createDatabaseBackup = async (req, res) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!mongoose.connection.db) and run the matching branch.
    if (!mongoose.connection.db) return res.status(503).json({ success: false, message: "Database connection unavailable" });
    // Declare db for use by the surrounding module or function.
    const db = mongoose.connection.db;
    // Check the condition (!fs.existsSync(BACKUP_DIR)) and run the matching branch.
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

    // Declare filename for use by the surrounding module or function.
    const filename = `database-backup-${Date.now()}.json`;
    // Declare filepath for use by the surrounding module or function.
    const filepath = path.join(BACKUP_DIR, filename);
    // Declare platformBackup for use by the surrounding module or function.
    const platformBackup = isTenantBypassed();
    // Declare backupData for use by the surrounding module or function.
    const backupData = {
      createdAt: new Date(),
      environment: process.env.NODE_ENV || "production",
      database: mongoose.connection.name || "unknown",
      scope: platformBackup ? "platform" : "tenant",
      tenantId: platformBackup ? null : (req.tenantId || null),
      createdBy: req.user?.email || req.user?._id || "system",
    };

    // Declare collections for use by the surrounding module or function.
    const collections = await db.listCollections().toArray();
    // Declare collectionNames for use by the surrounding module or function.
    const collectionNames = collections.map((collection) => collection.name);

    // Repeat the enclosed work for each required iteration.
    for (const collection of collections) {
      // Perform the side effect or state update expressed on the following line.
      backupData[collection.name] = await db
        .collection(collection.name)
        .find(backupCollectionFilter(req))
        .toArray();
    }

    // Perform the side effect or state update expressed on the following line.
    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));

    // Perform the side effect or state update expressed on the following line.
    await DatabaseBackup.create({
      file: filename,
      size: `${(fs.statSync(filepath).size / 1024 / 1024).toFixed(2)} MB`,
      collections: collectionNames,
      databaseName: mongoose.connection.name || "unknown",
      environment: process.env.NODE_ENV || "production",
      createdBy: req.user?.email || req.user?._id || "system",
      tenantId: platformBackup ? null : (req.tenantId || null),
    });

    // Perform the side effect or state update expressed on the following line.
    await createAuditLog({ user: req.user?._id, action: "create", resource: "Database", description: `Database backup created: ${filename}`, status: "success", severity: "low" });
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, message: "Database backup created successfully", file: filename, scope: platformBackup ? "platform" : "tenant" });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("BACKUP ERROR DETAILS:", error.message, error.stack);
    // Perform the side effect or state update expressed on the following line.
    res.status(500).json({ success: false, message: publicErrorMessage(error) });
  }
};

// Declare listDatabaseBackups for use by the surrounding module or function.
export const listDatabaseBackups = async (req, res) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare backups for use by the surrounding module or function.
    const backups = await DatabaseBackup.find(backupFilter(req)).sort({ createdAt: -1 }).limit(10).lean();
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, backups });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("LIST BACKUPS ERROR", error);
    // Perform the side effect or state update expressed on the following line.
    res.status(500).json({ success: false, message: publicErrorMessage(error) });
  }
};

// Declare downloadDatabaseBackup for use by the surrounding module or function.
export const downloadDatabaseBackup = async (req, res) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare backup for use by the surrounding module or function.
    const backup = await DatabaseBackup.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    // Check the condition (!backup) and run the matching branch.
    if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });
    // Declare filepath for use by the surrounding module or function.
    const filepath = path.join(BACKUP_DIR, backup.file);
    // Check the condition (!fs.existsSync(filepath)) and run the matching branch.
    if (!fs.existsSync(filepath)) return res.status(404).json({ success: false, message: "Backup file missing" });
    // Perform the side effect or state update expressed on the following line.
    res.download(filepath);
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    await createAuditLog({ user: req.user?._id, action: "error", resource: "Database", description: error.message, status: "failed", severity: "high" });
    // Perform the side effect or state update expressed on the following line.
    res.status(500).json({ success: false, message: publicErrorMessage(error) });
  }
};

// Declare deleteDatabaseBackup for use by the surrounding module or function.
export const deleteDatabaseBackup = async (req, res) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare backup for use by the surrounding module or function.
    const backup = await DatabaseBackup.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    // Check the condition (!backup) and run the matching branch.
    if (!backup) return res.status(404).json({ success: false, message: "Backup not found" });
    // Declare filepath for use by the surrounding module or function.
    const filepath = path.join(BACKUP_DIR, backup.file);
    // Check the condition (fs.existsSync(filepath)) and run the matching branch.
    if (fs.existsSync(filepath)) fs.rmSync(filepath);
    // Perform the side effect or state update expressed on the following line.
    await DatabaseBackup.findOneAndDelete(mergeTenantFilter(req, { _id: req.params.id }));
    // Perform the side effect or state update expressed on the following line.
    res.json({ success: true, message: "Backup deleted successfully" });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    res.status(500).json({ success: false, message: publicErrorMessage(error) });
  }
};

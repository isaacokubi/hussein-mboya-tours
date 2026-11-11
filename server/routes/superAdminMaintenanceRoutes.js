/**
 * Purpose: super Admin Maintenance Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// Load express so this module can use its exported dependencies.
import express from "express";
// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import {
  protect,
  superAdminOnly
} from "../middleware/authMiddleware.js";

// Load ../controllers/superAdminOperationsController.js so this module can use its exported dependencies.
import {
  clearSystemCache,
  createDatabaseBackup,
  listDatabaseBackups,
  downloadDatabaseBackup,
  deleteDatabaseBackup
} from "../controllers/superAdminOperationsController.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);

// Perform the side effect or state update expressed on the following line.
router.use(protect, superAdminOnly);

/*
|--------------------------------------------------------------------------
| REAL SUPERADMIN MAINTENANCE OPERATIONS
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
router.get(
  "/backups",
  listDatabaseBackups
);

// Perform the side effect or state update expressed on the following line.
router.post(
  "/backup",
  createDatabaseBackup
);

// Perform the side effect or state update expressed on the following line.
router.post(
  "/maintenance/backup",
  createDatabaseBackup
);

// Perform the side effect or state update expressed on the following line.
router.post(
  "/cache",
  clearSystemCache
);

// Perform the side effect or state update expressed on the following line.
router.post(
  "/maintenance/cache",
  clearSystemCache
);

// Perform the side effect or state update expressed on the following line.
router.delete(
  "/backups/:id",
  deleteDatabaseBackup
);

// Perform the side effect or state update expressed on the following line.
router.get(
  "/database/backup/:id/download",
  downloadDatabaseBackup
);

// Perform the side effect or state update expressed on the following line.
router.post(
  "/database/backup",
  createDatabaseBackup
);

// Perform the side effect or state update expressed on the following line.
router.post(
  "/database/cache-clear",
  clearSystemCache
);

export default router;

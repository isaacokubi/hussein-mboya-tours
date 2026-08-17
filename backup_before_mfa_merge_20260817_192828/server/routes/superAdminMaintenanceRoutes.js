import express from "express";
import {
  protect,
  superAdminOnly
} from "../middleware/authMiddleware.js";

import {
  clearSystemCache,
  createDatabaseBackup,
  listDatabaseBackups,
  downloadDatabaseBackup,
  deleteDatabaseBackup
} from "../controllers/superAdminOperationsController.js";

const router = express.Router();

router.use(protect, superAdminOnly);

/*
|--------------------------------------------------------------------------
| REAL SUPERADMIN MAINTENANCE OPERATIONS
|--------------------------------------------------------------------------
*/

router.get(
  "/backups",
  listDatabaseBackups
);

router.post(
  "/backup",
  createDatabaseBackup
);

router.post(
  "/maintenance/backup",
  createDatabaseBackup
);

router.post(
  "/cache",
  clearSystemCache
);

router.post(
  "/maintenance/cache",
  clearSystemCache
);

router.delete(
  "/backups/:id",
  deleteDatabaseBackup
);

router.get(
  "/database/backup/:id/download",
  downloadDatabaseBackup
);

router.post(
  "/database/backup",
  createDatabaseBackup
);

router.post(
  "/database/cache-clear",
  clearSystemCache
);

export default router;

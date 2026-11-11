/**
 * Purpose: notification Routes API route module. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { resolveTenant } from "../middleware/tenantMiddleware.js";
// server/routes/notificationRoutes.js

// Load express so this module can use its exported dependencies.
import express from "express";

// Load ../controllers/notificationController.js so this module can use its exported dependencies.
import {
  getNotifications,
  getMyNotifications,
  markRead,
  getNotificationRecipients,
  sendInternalNotification,
} from "../controllers/notificationController.js";

// Load ../middleware/authMiddleware.js so this module can use its exported dependencies.
import {
  protect,
} from "../middleware/authMiddleware.js";

// Load ../middleware/roleMiddleware.js so this module can use its exported dependencies.
import { roleMiddleware } from "../middleware/roleMiddleware.js";

// Declare router for use by the surrounding module or function.
const router = express.Router();

// Perform the side effect or state update expressed on the following line.
router.use(resolveTenant);

/*
|--------------------------------------------------------------------------
| AUTHORIZATION
|--------------------------------------------------------------------------
|
| All notification routes require authentication.
|
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
router.use(protect);

// Perform the side effect or state update expressed on the following line.
router.get("/recipients", roleMiddleware("admin", "super_admin", "superadmin", "tour_manager", "tourmanager", "manager"), getNotificationRecipients);
// Perform the side effect or state update expressed on the following line.
router.post("/internal", roleMiddleware("admin", "super_admin", "superadmin", "tour_manager", "tourmanager", "manager"), sendInternalNotification);

/*
|--------------------------------------------------------------------------
| NOTIFICATIONS
|--------------------------------------------------------------------------
*/

/**
 * GET /api/notifications
 * Get notifications for the authenticated user.
 */
// Perform the side effect or state update expressed on the following line.
router.get(
  "/",
  getNotifications
);

/**
 * GET /api/notifications/mine
 * Alias for getting the authenticated user's notifications.
 */
// Perform the side effect or state update expressed on the following line.
router.get(
  "/mine",
  getMyNotifications
);

/**
 * PUT /api/notifications/:id/read
 * Mark a notification as read.
 */
// Perform the side effect or state update expressed on the following line.
router.put(
  "/:id/read",
  markRead
);

export default router;

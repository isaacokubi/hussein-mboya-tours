// server/routes/notificationRoutes.js

import express from "express";

import {
  getNotifications,
  getMyNotifications,
  markRead,
} from "../controllers/notificationController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AUTHORIZATION
|--------------------------------------------------------------------------
|
| All notification routes require authentication.
|
|--------------------------------------------------------------------------
*/

router.use(protect);

/*
|--------------------------------------------------------------------------
| NOTIFICATIONS
|--------------------------------------------------------------------------
*/

/**
 * GET /api/notifications
 * Get notifications for the authenticated user.
 */
router.get(
  "/",
  getNotifications
);

/**
 * GET /api/notifications/mine
 * Alias for getting the authenticated user's notifications.
 */
router.get(
  "/mine",
  getMyNotifications
);

/**
 * PUT /api/notifications/:id/read
 * Mark a notification as read.
 */
router.put(
  "/:id/read",
  markRead
);

export default router;
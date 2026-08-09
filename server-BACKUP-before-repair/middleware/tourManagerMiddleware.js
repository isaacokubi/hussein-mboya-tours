// server/middleware/tourManagerMiddleware.js

/**
 * TOUR MANAGER AUTHORIZATION
 *
 * Uses the centralized roleMiddleware so role normalization
 * is consistent across the entire backend.
 */

import { roleMiddleware } from "./roleMiddleware.js";

const tourManagerOnly = roleMiddleware(
  "tour_manager",
  "tourmanager",
  "manager",
  "admin",
  "superadmin",
  "super_admin"
);

export default tourManagerOnly;

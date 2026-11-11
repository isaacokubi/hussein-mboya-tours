/**
 * Purpose: tour Manager Middleware request middleware. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/middleware/tourManagerMiddleware.js

/**
 * TOUR MANAGER AUTHORIZATION
 *
 * Uses the centralized roleMiddleware so role normalization
 * is consistent across the entire backend.
 */

// Load ./roleMiddleware.js so this module can use its exported dependencies.
import { roleMiddleware } from "./roleMiddleware.js";

// Declare tourManagerOnly for use by the surrounding module or function.
const tourManagerOnly = roleMiddleware(
  "tour_manager",
  "tourmanager",
  "manager",
  "admin",
  "super_admin",
  "super_admin"
);

export default tourManagerOnly;

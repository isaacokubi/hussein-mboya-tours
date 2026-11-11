/**
 * Purpose: phase3 Invoice Access HTTP controller. Main declarations: canAccessBooking.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter } from "../tenancy/context.js";
// Load ../utils/roleUtils.js so this module can use its exported dependencies.
import { getUserRole } from "../utils/roleUtils.js";

// Declare canAccessBooking for use by the surrounding module or function.
export const canAccessBooking = (booking, user) => {
  // Declare role for use by the surrounding module or function.
  const role = getUserRole(user);
  // Check the condition (["admin", "super_admin", "manager", "agent"].includes(role)) and run the matching branch.
  if (["admin", "super_admin", "manager", "agent"].includes(role)) return true;
  // Declare requesterId for use by the surrounding module or function.
  const requesterId = String(user?._id || "");
  // Return the expression shown below to the caller.
  return requesterId && (
    String(booking?.user?._id || booking?.user || "") === requesterId ||
    String(booking?.customer?.user?._id || booking?.customer?.user || "") === requesterId
  );
};

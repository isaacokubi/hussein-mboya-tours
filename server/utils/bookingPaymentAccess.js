/**
 * Purpose: booking Payment Access server application module. Main declarations: normalizeRole, isBookingPaymentStaff, ownsBookingPayment, canAccessBookingPayment.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
const normalizeRole = (user) => String(
  user?.roleId?.name || user?.role?.name || user?.role || user?.legacyRole || "",
).trim().toLowerCase().replace(/[\s_-]/g, "");

// Declare STAFF_ROLES for use by the surrounding module or function.
const STAFF_ROLES = new Set([
  "admin", "superadmin", "administrator", "manager", "tourmanager",
  "guide", "tourguide", "agent", "travelagent",
]);

// Declare isBookingPaymentStaff for use by the surrounding module or function.
export const isBookingPaymentStaff = (user) => STAFF_ROLES.has(normalizeRole(user));

// Declare ownsBookingPayment for use by the surrounding module or function.
export const ownsBookingPayment = (booking, user) => {
  // Check the condition (!booking || !user?._id) and run the matching branch.
  if (!booking || !user?._id) return false;
  // Declare userId for use by the surrounding module or function.
  const userId = String(user._id);
  // Return the expression shown below to the caller.
  return String(booking.user?._id || booking.user || "") === userId
    || String(booking.customer?._id || booking.customer || "") === userId;
};

// Declare canAccessBookingPayment for use by the surrounding module or function.
export const canAccessBookingPayment = (booking, user) => (
  isBookingPaymentStaff(user) || ownsBookingPayment(booking, user)
);

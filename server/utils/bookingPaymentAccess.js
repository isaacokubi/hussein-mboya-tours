const normalizeRole = (user) => String(
  user?.roleId?.name || user?.role?.name || user?.role || user?.legacyRole || "",
).trim().toLowerCase().replace(/[\s_-]/g, "");

const STAFF_ROLES = new Set([
  "admin", "superadmin", "administrator", "manager", "tourmanager",
  "guide", "tourguide", "agent", "travelagent",
]);

export const isBookingPaymentStaff = (user) => STAFF_ROLES.has(normalizeRole(user));

export const ownsBookingPayment = (booking, user) => {
  if (!booking || !user?._id) return false;
  const userId = String(user._id);
  return String(booking.user?._id || booking.user || "") === userId
    || String(booking.customer?._id || booking.customer || "") === userId;
};

export const canAccessBookingPayment = (booking, user) => (
  isBookingPaymentStaff(user) || ownsBookingPayment(booking, user)
);

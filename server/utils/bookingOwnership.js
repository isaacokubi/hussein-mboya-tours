/**
 * Purpose: booking Ownership server application module. Main declarations: normalizeRole, isStaff, ownsBooking, canAccessBooking.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
/*
|--------------------------------------------------------------------------
| BOOKING OWNERSHIP HELPERS
|--------------------------------------------------------------------------
*/

// Declare normalizeRole for use by the surrounding module or function.
export const normalizeRole = (user) => {

  // Return the result of String(     user?.roleId?.name ||     user?.role ||     user?.legacyRole ||     ""   )     .trim()     .toLowerCase()     .replace() to the caller.
  return String(
    user?.roleId?.name ||
    user?.role ||
    user?.legacyRole ||
    ""
  )
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");
};


// Declare isStaff for use by the surrounding module or function.
export const isStaff = (user) => {

  // Return the result of [     "admin",     "super_admin",     "administrator",     "manager",     "tourmanager",     "guide",     "tourguide",     "agent",     "travelagent",   ].includes() to the caller.
  return [
    "admin",
    "super_admin",
    "administrator",
    "manager",
    "tourmanager",
    "guide",
    "tourguide",
    "agent",
    "travelagent",
  ].includes(
    normalizeRole(user)
  );
};


// Declare ownsBooking for use by the surrounding module or function.
export const ownsBooking = (
  booking,
  user
) => {

  // Check the condition (!booking || !user?._id) and run the matching branch.
  if (
    !booking ||
    !user?._id
  ) {
    // Return the expression shown below to the caller.
    return false;
  }

  // Declare userId for use by the surrounding module or function.
  const userId =
    user._id.toString();

  // Return the expression shown below to the caller.
  return (
    booking.user?.toString() === userId ||
    booking.customer?.toString() === userId ||
    (
      booking.customerSnapshot?.email &&
      user.email &&
      String(
        booking.customerSnapshot.email
      ).toLowerCase() ===
      String(
        user.email
      ).toLowerCase()
    )
  );
};


// Declare canAccessBooking for use by the surrounding module or function.
export const canAccessBooking = (
  booking,
  user
) => {

  // Return the expression shown below to the caller.
  return (
    isStaff(user) ||
    ownsBooking(
      booking,
      user
    )
  );
};

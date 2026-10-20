/*
|--------------------------------------------------------------------------
| BOOKING OWNERSHIP HELPERS
|--------------------------------------------------------------------------
*/

// Convert the user's role into a compact value for staff-role comparisons.
export const normalizeRole = (user) => {
  // Read the populated role, direct role or legacy role, in that order.
  return String(
    user?.roleId?.name ||
    user?.role ||
    user?.legacyRole ||
    ""
  )
    .trim() // Remove whitespace surrounding the role label.
    .toLowerCase() // Ignore differences in capitalization.
    .replace(/[\s_-]/g, ""); // Remove separators so legacy spellings compare consistently.
};

// Determine whether a user has one of the roles allowed to access staff workflows.
export const isStaff = (user) => {
  // Compare the normalized role against the staff roles recognized by this helper.
  return [
    "admin", // Administrator role.
    "super_admin", // Platform administrator role.
    "administrator", // Legacy administrator label.
    "manager", // Generic manager role.
    "tourmanager", // Compact tour-manager label after normalization.
    "guide", // Generic guide role.
    "tourguide", // Compact tour-guide label after normalization.
    "agent", // Booking/travel agent role.
    "travelagent", // Compact travel-agent label after normalization.
  ].includes(
    normalizeRole(user) // Normalize before checking so spacing/case do not change the result.
  );
};

// Determine whether the supplied user owns the booking.
export const ownsBooking = (
  booking, // Booking record whose ownership is being checked.
  user // Authenticated user requesting access.
) => {
  // Missing records or users without an identifier cannot establish ownership.
  if (
    !booking ||
    !user?._id
  ) {
    // Deny access safely when ownership information is incomplete.
    return false;
  }

  // Convert the user identifier to a string for stable comparisons.
  const userId =
    user._id.toString();

  // Accept ownership through direct user ID, customer ID, or matching customer snapshot email.
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

// Determine whether the user is permitted to access the booking.
export const canAccessBooking = (
  booking, // Booking record to protect.
  user // Authenticated user being authorized.
) => {
  // Staff can access operational bookings; customers must own the booking.
  return (
    isStaff(user) ||
    ownsBooking(
      booking, // Pass the target booking into the ownership check.
      user // Pass the current user whose ownership is being tested.
    )
  );
};

/*
|--------------------------------------------------------------------------
| BOOKING OWNERSHIP HELPERS
|--------------------------------------------------------------------------
*/

export const normalizeRole = (user) => {

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


export const isStaff = (user) => {

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


export const ownsBooking = (
  booking,
  user
) => {

  if (
    !booking ||
    !user?._id
  ) {
    return false;
  }

  const userId =
    user._id.toString();

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


export const canAccessBooking = (
  booking,
  user
) => {

  return (
    isStaff(user) ||
    ownsBooking(
      booking,
      user
    )
  );
};

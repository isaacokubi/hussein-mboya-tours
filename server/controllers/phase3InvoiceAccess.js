import { mergeTenantFilter } from "../tenancy/context.js";
import { getUserRole } from "../utils/roleUtils.js";

export const canAccessBooking = (booking, user) => {
  const role = getUserRole(user);
  if (["admin", "superadmin", "manager", "agent"].includes(role)) return true;
  const requesterId = String(user?._id || "");
  return requesterId && (
    String(booking?.user?._id || booking?.user || "") === requesterId ||
    String(booking?.customer?.user?._id || booking?.customer?.user || "") === requesterId
  );
};

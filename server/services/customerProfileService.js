import Customer from "../models/Customer.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

const splitName = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return { firstName: parts.shift() || "Customer", lastName: parts.join(" ") || "Account" };
};

export const ensureCustomerProfile = async (user, { createdBy = null } = {}) => {
  if (!user || String(user.role || "").trim().toLowerCase() !== "customer") return null;
  if (!user.tenantId) return null;

  const tenantId = requireTenantId();
  if (String(tenantId) !== String(user.tenantId)) {
    const error = new Error("Customer profile tenant mismatch");
    error.status = 403;
    error.code = "CUSTOMER_TENANT_MISMATCH";
    throw error;
  }

  const existing = await Customer.findOne(
    mergeTenantFilter({ user: user._id, isDeleted: { $ne: true } })
  );
  if (existing) return existing;

  const { firstName, lastName } = splitName(user.name);
  try {
    return await Customer.create({
      user: user._id,
      firstName,
      lastName,
      email: user.email || "",
      phone: user.phone || "",
      loyaltyPoints: Number(user.loyaltyPoints || 0),
      status: user.status === "active" ? "active" : "inactive",
      createdBy,
      updatedBy: createdBy,
      tenantId,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return Customer.findOne(
        mergeTenantFilter({ user: user._id, isDeleted: { $ne: true } })
      );
    }
    throw error;
  }
};
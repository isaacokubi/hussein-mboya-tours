/**
 * Purpose: customer Profile Service business-logic service. Main declarations: splitName, ensureCustomerProfile.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Customer from "../models/Customer.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

// Declare splitName for use by the surrounding module or function.
const splitName = (name = "") => {
  // Declare parts for use by the surrounding module or function.
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  // Return the object assembled below to the caller.
  return { firstName: parts.shift() || "Customer", lastName: parts.join(" ") || "Account" };
};

// Declare ensureCustomerProfile for use by the surrounding module or function.
export const ensureCustomerProfile = async (user, { createdBy = null } = {}) => {
  // Check the condition (!user || String(user.role || "").trim().toLowerCase() !== "customer") and run the matching branch.
  if (!user || String(user.role || "").trim().toLowerCase() !== "customer") return null;
  // Check the condition (!user.tenantId) and run the matching branch.
  if (!user.tenantId) return null;

  // Declare tenantId for use by the surrounding module or function.
  const tenantId = requireTenantId();
  // Check the condition (String(tenantId) !== String(user.tenantId)) and run the matching branch.
  if (String(tenantId) !== String(user.tenantId)) {
    // Declare error for use by the surrounding module or function.
    const error = new Error("Customer profile tenant mismatch");
    // Perform the side effect or state update expressed on the following line.
    error.status = 403;
    // Perform the side effect or state update expressed on the following line.
    error.code = "CUSTOMER_TENANT_MISMATCH";
    // Stop the current operation by raising the value of error.
    throw error;
  }

  // Declare existing for use by the surrounding module or function.
  const existing = await Customer.findOne(
    mergeTenantFilter({ user: user._id, isDeleted: { $ne: true } })
  );
  // Check the condition (existing) and run the matching branch.
  if (existing) return existing;

  // Declare { firstName, lastName } for use by the surrounding module or function.
  const { firstName, lastName } = splitName(user.name);
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Return the completed the result of Customer.create() operation to the caller.
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
    // Check the condition (error?.code === 11000) and run the matching branch.
    if (error?.code === 11000) {
      // Return the result of Customer.findOne() to the caller.
      return Customer.findOne(
        mergeTenantFilter({ user: user._id, isDeleted: { $ne: true } })
      );
    }
    // Stop the current operation by raising the value of error.
    throw error;
  }
};
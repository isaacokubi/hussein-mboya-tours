// Build a tenant-scoped query from the authenticated Express request.
export function tenantQuery(req, extra = {}) {
  // Require both an authenticated user and a tenant identifier before querying tenant data.
  if (
    !req.user ||
    !req.user.tenantId
  ) {
    // Stop rather than allowing the caller to issue an unscoped tenant query.
    throw new Error("Tenant context missing");
  }

  // Preserve caller filters while forcing the query to the user's tenant.
  return {
    ...extra, // Keep requested filters such as status or record ID.
    tenantId: req.user.tenantId // Add/override tenantId so the query cannot select another tenant.
  };
}

// Return a platform-level filter unchanged for explicitly authorized cross-tenant operations.
export function platformQuery(extra = {}) {
  // Do not inject a tenant ID because platform operations may intentionally span tenants.
  return extra;
}

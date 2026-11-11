/**
 * Purpose: kenya Compliance Service business-logic service. Main declarations: clean, buildKenyaComplianceSnapshot, generateIdempotencyKey, getTenantKenyaCompliance.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import crypto from "crypto";
// Load ../models/Tenant.js so this module can use its exported dependencies.
import Tenant from "../models/Tenant.js";

// Declare clean for use by the surrounding module or function.
const clean = (value) => (value == null ? "" : String(value).trim());

// Define buildKenyaComplianceSnapshot; its parameters and body implement this operation.
export function buildKenyaComplianceSnapshot(tenant) {
  // Declare compliance for use by the surrounding module or function.
  const compliance = tenant?.kenyaCompliance || {};
  // Declare tax for use by the surrounding module or function.
  const tax = tenant?.taxProfile || {};
  // Declare tra for use by the surrounding module or function.
  const tra = compliance.tra || {};
  // Declare odpc for use by the surrounding module or function.
  const odpc = compliance.odpc || {};
  // Declare etims for use by the surrounding module or function.
  const etims = compliance.etims || {};

  // Return the object assembled below to the caller.
  return {
    country: "KE",
    tax: {
      kraPin: clean(tax.kraPin || compliance.kraPin),
      vatRegistered: Boolean(tax.vatRegistered),
      vatNumber: clean(tax.vatNumber),
      taxInclusivePricing: tax.taxInclusivePricing !== false,
    },
    tra: {
      licenceNumber: clean(tra.licenceNumber),
      class: clean(tra.class),
      status: clean(tra.status || "unknown"),
      expiresAt: tra.expiresAt || null,
    },
    odpc: {
      role: clean(odpc.role || "unknown"),
      registrationNumber: clean(odpc.registrationNumber),
      status: clean(odpc.status || "unknown"),
    },
    etims: {
      enabled: Boolean(etims.enabled),
      status: clean(etims.status || "not_configured"),
      lastSubmissionAt: etims.lastSubmissionAt || null,
    },
  };
}

// Define generateIdempotencyKey; its parameters and body implement this operation.
export function generateIdempotencyKey(prefix = "KE") {
  // Return the expression shown below to the caller.
  return `${prefix}-${crypto.randomUUID()}`;
}

// Define getTenantKenyaCompliance; its parameters and body implement this operation.
export async function getTenantKenyaCompliance(tenantId) {
  // Declare tenant for use by the surrounding module or function.
  const tenant = await Tenant.findById(tenantId).select("taxProfile kenyaCompliance").lean();
  // Check the condition (!tenant) and run the matching branch.
  if (!tenant) {
    // Declare error for use by the surrounding module or function.
    const error = new Error("Tenant not found.");
    // Perform the side effect or state update expressed on the following line.
    error.statusCode = 404;
    // Stop the current operation by raising the value of error.
    throw error;
  }
  // Return the result of buildKenyaComplianceSnapshot() to the caller.
  return buildKenyaComplianceSnapshot(tenant);
}

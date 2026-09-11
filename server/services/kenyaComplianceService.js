import crypto from "crypto";
import Tenant from "../models/Tenant.js";

const clean = (value) => (value == null ? "" : String(value).trim());

export function buildKenyaComplianceSnapshot(tenant) {
  const compliance = tenant?.kenyaCompliance || {};
  const tax = tenant?.taxProfile || {};
  const tra = compliance.tra || {};
  const odpc = compliance.odpc || {};
  const etims = compliance.etims || {};

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

export function generateIdempotencyKey(prefix = "KE") {
  return `${prefix}-${crypto.randomUUID()}`;
}

export async function getTenantKenyaCompliance(tenantId) {
  const tenant = await Tenant.findById(tenantId).select("taxProfile kenyaCompliance").lean();
  if (!tenant) {
    const error = new Error("Tenant not found.");
    error.statusCode = 404;
    throw error;
  }
  return buildKenyaComplianceSnapshot(tenant);
}

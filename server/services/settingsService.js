import { getTenantContext, requireTenantId } from "../tenancy/context.js";
import SystemSetting from "../models/SystemSetting.js";
import { COMPANY_DEFAULTS } from "../config/companyDefaults.js";

const DEFAULTS = COMPANY_DEFAULTS;

export async function getSystemSettings() {
  requireTenantId();

  const { tenantId } = getTenantContext();

  let settings = await SystemSetting.findOne({
    tenantId,
    key: "default",
  }).lean();

  if (!settings) {
    settings = await SystemSetting.create({
      tenantId,
      key: "default",
      ...DEFAULTS,
    });

    settings = settings.toObject();
  }

  return settings;
}

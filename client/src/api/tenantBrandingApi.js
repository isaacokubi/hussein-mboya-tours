/**
 * Purpose: tenant Branding Api client application module. Main declarations: getTenantBranding, updateTenantBranding.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import api from "./axios";

/**
 * Public branding is resolved from the active tenant by /api/settings/public.
 * Do not hard-code a business name here: the same frontend must work for every tenant.
 */
// Declare getTenantBranding for use by the surrounding module or function.
export const getTenantBranding = async () => {
  // Declare response for use by the surrounding module or function.
  const response = await api.get("/settings/public", {
    params: { _t: Date.now() },
  });

  // Declare settings for use by the surrounding module or function.
  const settings = response.data?.settings || response.data?.data || {};
  // Declare companyName for use by the surrounding module or function.
  const companyName = settings.companyName || settings.name || "";
  // Declare logo for use by the surrounding module or function.
  const logo = settings.companyLogo || settings.logo || "";

  // Return the object assembled below to the caller.
  return {
    ...response.data,
    branding: {
      ...settings,
      name: companyName,
      legalName: settings.legalName || companyName,
      logo,
      logoUrl: settings.companyLogo || settings.logoUrl || logo,
      contactEmail: settings.supportEmail || "",
      contactPhone: settings.supportPhone || "",
      website: settings.websiteUrl || "",
    },
  };
};

// Declare updateTenantBranding for use by the surrounding module or function.
export const updateTenantBranding = async (data) => {
  // Declare response for use by the surrounding module or function.
  const response = await api.put("/tenant/branding", data);
  // Return the data value to the caller.
  return response.data;
};

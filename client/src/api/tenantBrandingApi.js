import api from "./axios";

/**
 * Public branding is resolved from the active tenant by /api/settings/public.
 * Do not hard-code a business name here: the same frontend must work for every tenant.
 */
export const getTenantBranding = async () => {
  const response = await api.get("/settings/public", {
    params: { _t: Date.now() },
  });

  const settings = response.data?.settings || response.data?.data || {};
  const companyName = settings.companyName || settings.name || "";
  const logo = settings.companyLogo || settings.logo || "";

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

export const updateTenantBranding = async (data) => {
  const response = await api.put("/tenant/branding", data);
  return response.data;
};

import api from "./axios";

/**
 * Public branding is served by /api/settings/public. The old
 * /api/tenant/branding endpoint is tenant-admin infrastructure and
 * requires tenant resolution, so it must not be used by the public app.
 */
export const getTenantBranding = async () => {
  const response = await api.get("/settings/public", {
    params: { _t: Date.now() },
  });

  const settings = response.data?.settings || response.data?.data || {};

  return {
    ...response.data,
    branding: {
      ...settings,
      name: "Coherent Tours",
      legalName: "Coherent Tours",
      logo: settings.companyLogo || settings.logo || "",
      logoUrl: settings.companyLogo || settings.logoUrl || "",
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

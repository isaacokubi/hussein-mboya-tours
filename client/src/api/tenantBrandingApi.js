// Import the shared API client so tenant context is attached consistently.
import api from "./axios";

/**
 * Public branding is resolved from the active tenant by /api/settings/public.
 * Do not hard-code a business name here: the same frontend must work for every tenant.
 */
// Fetch and normalize public branding/settings for the active tenant.
export const getTenantBranding = async () => {
  // Add a timestamp query parameter to reduce stale browser/proxy caching of branding.
  const response = await api.get("/settings/public", {
    params: { _t: Date.now() },
  });

  // Read the returned settings object from either supported response shape.
  const settings = response.data?.settings || response.data?.data || {};
  // Resolve the company display name from current or legacy field names.
  const companyName = settings.companyName || settings.name || "";
  // Resolve the logo from current or legacy field names.
  const logo = settings.companyLogo || settings.logo || "";

  // Preserve the response while exposing a normalized branding object to the UI.
  return {
    ...response.data,
    branding: {
      ...settings, // Preserve other branding fields returned by the backend.
      name: companyName, // Standard display-name property used by the tenant context.
      legalName: settings.legalName || companyName, // Use display name when no legal name is configured.
      logo, // Expose the normalized logo value.
      logoUrl: settings.companyLogo || settings.logoUrl || logo, // Support all known logo property names.
      contactEmail: settings.supportEmail || "", // Normalize missing support email to an empty string.
      contactPhone: settings.supportPhone || "", // Normalize missing support phone to an empty string.
      website: settings.websiteUrl || "", // Normalize the public website field.
    },
  };
};

// Save tenant branding changes and return the backend response.
export const updateTenantBranding = async (data) => {
  // Submit the updated branding object to the tenant branding endpoint.
  const response = await api.put("/tenant/branding", data);
  // Return response data without the Axios transport wrapper.
  return response.data;
};

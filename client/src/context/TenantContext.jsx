// Import React primitives for context, state, effects and context consumption.
import React, { createContext, useContext, useEffect, useState } from "react";
// Import the API call that retrieves tenant-specific branding.
import { getTenantBranding } from "../api/tenantBrandingApi";
// Read the authenticated user to decide which tenant identity should be displayed.
import { useAuth } from "./AuthContext";
// Read saved company settings so branding updates appear without a reload.
import { useSettings } from "./SettingsContext";

// Define the platform's default public brand name.
export const PLATFORM_BRAND_NAME = "Kenya Tours";

// Define safe empty/default values used before tenant branding has loaded.
const DEFAULT_TENANT = {
  name: "", // Tenant display name.
  legalName: "", // Registered/legal tenant name.
  currency: "KES", // Default display currency for the Kenyan platform.
  timezone: "Africa/Nairobi", // Default timezone for Kenyan users and tours.
  slug: "", // Tenant URL slug when one is known.
  logoUrl: "", // Optional tenant logo URL.
  favicon: "", // Optional tenant favicon URL.
  brandColors: {}, // Optional primary/secondary/accent brand colors.
};

// Define the platform-wide identity used for SuperAdmin screens.
const PLATFORM_TENANT = {
  ...DEFAULT_TENANT, // Keep all expected tenant fields available.
  name: PLATFORM_BRAND_NAME, // Display the platform brand.
  legalName: PLATFORM_BRAND_NAME, // Use the platform brand as the default legal label.
  slug: "global-tours-platform", // Stable identifier for the platform scope.
};

// Create the React context through which tenant identity is shared.
const TenantContext = createContext();

// Normalize role fields that may be represented as strings or populated objects.
const normalizeRole = (user) => {
  // Return an empty role when there is no authenticated user.
  if (!user) return "";
  // Normalize a simple string role by lowercasing and standardizing separators.
  if (typeof user.role === "string") return user.role.toLowerCase().replace(/[\s-]/g, "_");
  // Prefer the populated role object's name when available.
  if (user.role?.name) return String(user.role.name).toLowerCase().replace(/[\s-]/g, "_");
  // Support legacy users whose roles are stored in an array.
  if (Array.isArray(user.roles) && user.roles[0]?.name) return String(user.roles[0].name).toLowerCase().replace(/[\s-]/g, "_");
  // Return an empty role when no recognized role field is populated.
  return "";
};

// Identify platform SuperAdmin accounts across supported legacy role spellings.
const isSuperAdminUser = (user) => ["super_admin", "superadmin"].includes(normalizeRole(user));

// Read a tenant slug from the current hostname when the frontend runs in a browser.
const getTenantSlugFromHost = () => {
  // Avoid referencing window during server-side rendering or non-browser tests.
  if (typeof window === "undefined") return "";
  // Normalize the active browser hostname for suffix comparisons.
  const host = window.location.hostname.toLowerCase();
  // Read the configured platform domain, using the default public domain as a fallback.
  const platformHost = String(import.meta.env.VITE_PLATFORM_HOST || "globaltours.com").toLowerCase();
  // Build the suffix expected for tenant subdomains.
  const suffix = `.${platformHost}`;
  // If the host belongs to the platform domain, return its final tenant subdomain label.
  if (host.endsWith(suffix)) return host.slice(0, -suffix.length).split(".").filter(Boolean).pop() || "";
  // Return an empty slug for custom domains or hosts outside the platform suffix.
  return "";
};

// Apply the active tenant's name, favicon and brand colors to the browser document.
const applyTenantIdentity = (tenant) => {
  // Skip document changes when running without a browser DOM.
  if (typeof document === "undefined") return;
  // Update the browser tab title using the tenant name or a generic fallback.
  document.title = tenant.name || "Tours & Travel";

  // Update the favicon only when the tenant has supplied one.
  if (tenant.favicon) {
    // Find the existing favicon link element.
    let favicon = document.querySelector('link[rel="icon"]');
    // Create the link element if the page does not already have one.
    if (!favicon) {
      favicon = document.createElement("link");
      // Mark the new link as a browser favicon.
      favicon.rel = "icon";
      // Attach the new link to the document head so the browser can load it.
      document.head.appendChild(favicon);
    }
    // Set the favicon URL to the tenant-provided image.
    favicon.href = tenant.favicon;
  }

  // Access the document root where shared CSS custom properties are defined.
  const root = document.documentElement;
  // Use an empty object when no tenant color configuration exists.
  const colors = tenant.brandColors || {};
  // Apply the tenant primary color only when it is configured.
  if (colors.primary) root.style.setProperty("--tenant-primary", colors.primary);
  // Apply the tenant secondary color only when it is configured.
  if (colors.secondary) root.style.setProperty("--tenant-secondary", colors.secondary);
  // Apply the tenant accent color only when it is configured.
  if (colors.accent) root.style.setProperty("--tenant-accent", colors.accent);
};

// Provide tenant branding state to all child components in the React tree.
export function TenantProvider({ children }) {
  // Read the current signed-in user from authentication context.
  const { user } = useAuth();
  // Read organization settings and whether the UI is in platform scope.
  const { settings = {}, isPlatformScope } = useSettings() || {};
  // Initialize the tenant state with safe defaults until data is loaded.
  const [tenant, setTenant] = useState(DEFAULT_TENANT);

  // Load branding when the authenticated user changes.
  useEffect(() => {
    // Track whether this effect is still mounted to avoid stale async state updates.
    let mounted = true;

    // Fetch tenant branding or select platform branding for a SuperAdmin.
    const loadTenant = async () => {
      // Platform administrators use platform identity instead of tenant branding.
      if (isSuperAdminUser(user)) {
        // Ignore the update if the component has already unmounted.
        if (!mounted) return;
        // Store the platform identity in React state.
        setTenant(PLATFORM_TENANT);
        // Synchronize the document title/favicon/colors with platform identity.
        applyTenantIdentity(PLATFORM_TENANT);
        // Stop; platform admins do not need a tenant branding request.
        return;
      }

      try {
        // Request the active tenant's branding from the backend.
        const res = await getTenantBranding();
        // Ignore results from a request that completed after unmount.
        if (!mounted) return;

        // Read the branding object from the response, defaulting to an empty object.
        const branding = res?.branding || {};
        // Resolve the display name from either name or legacy companyName.
        const name = branding.name || branding.companyName || "";
        // Use the explicit legal name, falling back to the display name.
        const legalName = branding.legalName || name;
        // Derive a tenant slug from the current host as a fallback.
        const hostSlug = getTenantSlugFromHost();
        // Combine defaults and server branding, then normalize the important identity fields.
        const nextTenant = {
          ...DEFAULT_TENANT, // Keep expected keys even when the backend omits optional values.
          ...branding, // Allow the backend to supply logo, colors and other branding details.
          name, // Store the resolved display name.
          legalName, // Store the resolved legal name.
          slug: branding.slug || hostSlug, // Prefer the server slug over the host-derived slug.
        };

        // Save the resolved tenant branding in React state.
        setTenant(nextTenant);
        // Apply the same branding to the document title/favicon/CSS properties.
        applyTenantIdentity(nextTenant);
      } catch (error) {
        // Log a diagnostic message if public branding cannot be loaded.
        console.error("Public tenant branding load failed", error);
        // Reset to defaults only while this component is still mounted.
        if (mounted) {
          // Clear tenant-specific branding after the request fails.
          setTenant(DEFAULT_TENANT);
          // Use a stable application title as a fallback.
          document.title = "Hussein Mboya Tours";
        }
      }
    };

    // Start the asynchronous load without making the effect callback itself async.
    void loadTenant();
    // Mark the effect as inactive when the component unmounts or the user changes.
    return () => { mounted = false; };
  }, [user]); // Reload branding when the authenticated user identity changes.

  // Settings are the authoritative UI representation of the active scope.
  // Keep tenant identity synchronized when an admin saves branding without
  // requiring a full page reload or a second branding request.
  useEffect(() => {
    // Platform administrators/platform scope should not inherit a tenant's branding.
    if (isSuperAdminUser(user) || isPlatformScope) return;
    // Do nothing until company settings provide a usable display name.
    if (!settings?.companyName) return;

    // Merge updated settings into the previous tenant state to preserve unrelated fields.
    setTenant((previous) => {
      // Build the next identity from previous branding and the latest company settings.
      const next = {
        ...previous, // Preserve fields not represented by the settings module.
        name: settings.companyName, // Use the saved company name as the display name.
        legalName: previous.legalName || settings.companyName, // Preserve a legal name if one already exists.
        logoUrl: settings.companyLogo || previous.logoUrl || "", // Prefer the saved company logo.
        contactEmail: settings.supportEmail || previous.contactEmail || "", // Keep support email in tenant identity.
        contactPhone: settings.supportPhone || previous.contactPhone || "", // Keep support phone in tenant identity.
        address: settings.address || previous.address || "", // Keep the configured business address.
        city: settings.city || previous.city || "", // Keep the configured city.
        country: settings.country || previous.country || "", // Keep the configured country.
        // Merge new color settings without discarding other stored brand colors.
        brandColors: {
          ...(previous.brandColors || {}), // Retain colors not changed by this settings update.
          ...(settings.primaryColor ? { primary: settings.primaryColor } : {}), // Override primary color only when supplied.
          ...(settings.secondaryColor ? { secondary: settings.secondaryColor } : {}), // Override secondary color only when supplied.
          ...(settings.accentColor ? { accent: settings.accentColor } : {}), // Override accent color only when supplied.
        },
      };
      // Update the browser title/favicon/colors after settings change.
      applyTenantIdentity(next);
      // Return the new state object to React.
      return next;
    });
  }, [settings, user, isPlatformScope]); // Re-run when settings or the active scope changes.

  // Expose tenant state and the setter to all descendants through context.
  return (
    <TenantContext.Provider value={{ tenant, setTenant, isPlatformScope: isSuperAdminUser(user) }}>
      {/* Render the application subtree that consumes tenant context. */}
      {children}
    </TenantContext.Provider>
  );
}

// Provide a small hook so components can read the active tenant context.
export function useTenant() {
  // Return the nearest TenantContext value from the React component tree.
  return useContext(TenantContext);
}

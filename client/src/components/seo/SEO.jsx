import { useSettings } from "../../context/SettingsContext";
import { useTenant } from "../../context/TenantContext";
import { Helmet } from "react-helmet-async";

const CONFIGURED_SITE_URL = String(import.meta.env.VITE_SITE_URL || "").replace(/\/$/, "");
const SITE_ORIGIN = typeof window !== "undefined" ? window.location.origin : CONFIGURED_SITE_URL;
const DEFAULT_IMAGE = "/images/seo/default-og.jpg";

export default function SEO({
  title = "",
  description = "",
  keywords = "",
  image = DEFAULT_IMAGE,
  url = "",
  type = "website",
  noIndex = false,
}) {
  const { settings = {} } = useSettings() || {};
  const { tenant = {} } = useTenant() || {};
  const siteName = settings.companyName || tenant.name || tenant.companyName || "Travel company";
  const resolvedDescription = description || settings.seoDescription || tenant.seoDescription ||
    "Explore published tours, destinations and travel experiences from this travel company.";
  const resolvedKeywords = keywords || (Array.isArray(settings.seoKeywords) ? settings.seoKeywords.join(", ") : settings.seoKeywords) ||
    tenant.seoKeywords || "Kenya tours, safaris, destinations, travel experiences";
  const resolvedTitle = title || settings.seoTitle || tenant.seoTitle || siteName;
  const pageTitle = resolvedTitle === siteName ? siteName : `${resolvedTitle} | ${siteName}`;
  // Public tenant sites may use different subdomains or custom domains. Canonical URLs
  // must follow the host currently serving this tenant, not a build-time shared host.
  const canonicalPath = url || (typeof window !== "undefined" ? window.location.pathname : "/");
  const pageUrl = /^https?:\/\//i.test(canonicalPath)
    ? canonicalPath
    : `${SITE_ORIGIN}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`;
  const imageValue = image?.url || image;
  const pageImage = imageValue?.startsWith("http") ? imageValue : `${SITE_ORIGIN}${imageValue?.startsWith("/") ? imageValue : `/${imageValue || ""}`}`;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <meta name="keywords" content={resolvedKeywords} />
      <meta name="robots" content={noIndex ? "noindex,nofollow" : "index,follow"} />
      <link rel="canonical" href={pageUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:url" content={pageUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={pageImage} />
      <meta name="theme-color" content="#166534" />
      <meta name="author" content={siteName} />
    </Helmet>
  );
}

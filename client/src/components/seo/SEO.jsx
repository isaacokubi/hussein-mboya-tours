/**
 * Purpose: SEO reusable UI component. Main declarations: SEO.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useSettings } from "../../context/SettingsContext";
// Load react-helmet-async so this module can use its exported dependencies.
import { Helmet } from "react-helmet-async";

// Declare SITE_URL for use by the surrounding module or function.
const SITE_URL = String(import.meta.env.VITE_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/$/, "");
// Declare DEFAULT_IMAGE for use by the surrounding module or function.
const DEFAULT_IMAGE = "/images/seo/default-og.jpg";

// Define SEO; its parameters and body implement this operation.
export default function SEO({
  title = "",
  description = "Explore Kenya and East Africa with premium safaris, wildlife adventures, beach holidays, luxury tours, and tailor-made travel experiences.",
  keywords = "Kenya tours, Kenya safaris, Maasai Mara, Diani Beach, Amboseli, East Africa travel, luxury safaris",
  image = DEFAULT_IMAGE,
  url = "",
  type = "website",
  noIndex = false,
}) {
  // Declare { settings = {} } for use by the surrounding module or function.
  const { settings = {} } = useSettings() || {};
  // Declare siteName for use by the surrounding module or function.
  const siteName = settings.companyName || "Company";
  // Declare resolvedTitle for use by the surrounding module or function.
  const resolvedTitle = title || siteName;
  // Declare pageTitle for use by the surrounding module or function.
  const pageTitle = resolvedTitle === siteName ? siteName : `${resolvedTitle} | ${siteName}`;
  // Declare pageUrl for use by the surrounding module or function.
  const pageUrl = `${SITE_URL}${url}`;
  // Declare imageValue for use by the surrounding module or function.
  const imageValue = image?.url || image;
  // Declare pageImage for use by the surrounding module or function.
  const pageImage = imageValue?.startsWith("http") ? imageValue : `${SITE_URL}${imageValue}`;

  // Return the expression shown below to the caller.
  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={noIndex ? "noindex,nofollow" : "index,follow"} />
      <link rel="canonical" href={pageUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:url" content={pageUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={pageImage} />
      <meta name="theme-color" content="#166534" />
      <meta name="author" content={siteName} />
    </Helmet>
  );
}

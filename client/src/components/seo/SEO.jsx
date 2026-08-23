import { useSettings } from "../../context/SettingsContext";
import { Helmet } from "react-helmet-async";

const SITE_URL = import.meta.env.VITE_SITE_URL || "https://www.husseinmboyatours.com";
const DEFAULT_IMAGE = "/images/seo/default-og.jpg";

export default function SEO({
  title = "",
  description = "Explore Kenya and East Africa with premium safaris, wildlife adventures, beach holidays, luxury tours, and tailor-made travel experiences.",
  keywords = "Kenya tours, Kenya safaris, Maasai Mara, Diani Beach, Amboseli, East Africa travel, luxury safaris",
  image = DEFAULT_IMAGE,
  url = "",
  type = "website",
  noIndex = false,
}) {
  const { settings = {} } = useSettings() || {};
  const siteName = settings.companyName || "Company";
  const resolvedTitle = title || siteName;
  const pageTitle = resolvedTitle === siteName ? siteName : `${resolvedTitle} | ${siteName}`;
  const pageUrl = `${SITE_URL}${url}`;
  const imageValue = image?.url || image;
  const pageImage = imageValue?.startsWith("http") ? imageValue : `${SITE_URL}${imageValue}`;

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

import { useSettings } from "../../context/SettingsContext";
import { Helmet } from "react-helmet-async";

const SITE_URL =
  import.meta.env.VITE_SITE_URL ||
  "https://www.husseinmboyatours.com";

const DEFAULT_IMAGE =
  "/images/seo/default-og.jpg";

export default function SEO({
  title = SITE_NAME,
  description = "Explore Kenya and East Africa with premium safaris, wildlife adventures, beach holidays, luxury tours, and tailor-made travel experiences.",
  keywords = "Kenya tours, Kenya safaris, Maasai Mara, Diani Beach, Amboseli, East Africa travel, luxury safaris",
  image = DEFAULT_IMAGE,
  url = "",
  type = "website",
  noIndex = false,
}) {

  const { settings = {} } = useSettings() || {};

  const SITE_NAME = settings.companyName || "Coherent Tours";

  const pageTitle =
    title === SITE_NAME
      ? SITE_NAME
      : `${title} | ${SITE_NAME}`;

  const pageUrl = `${SITE_URL}${url}`;

  const pageImage = (image?.url || image)?.startsWith("http")
    ? image
    : `${SITE_URL}${image}`;

  return (
    <Helmet>
      {/* Primary */}

      <title>{pageTitle}</title>

      <meta
        name="description"
        content={description}
      />

      <meta
        name="keywords"
        content={keywords}
      />

      <meta
        name="robots"
        content={
          noIndex
            ? "noindex,nofollow"
            : "index,follow"
        }
      />

      <link
        rel="canonical"
        href={pageUrl}
      />

      {/* Open Graph */}

      <meta
        property="og:type"
        content={type}
      />

      <meta
        property="og:site_name"
        content={SITE_NAME}
      />

      <meta
        property="og:title"
        content={pageTitle}
      />

      <meta
        property="og:description"
        content={description}
      />

      <meta
        property="og:image"
        content={pageImage}
      />

      <meta
        property="og:url"
        content={pageUrl}
      />

      {/* Twitter */}

      <meta
        name="twitter:card"
        content="summary_large_image"
      />

      <meta
        name="twitter:title"
        content={pageTitle}
      />

      <meta
        name="twitter:description"
        content={description}
      />

      <meta
        name="twitter:image"
        content={pageImage}
      />

      {/* Theme */}

      <meta
        name="theme-color"
        content="#166534"
      />

      <meta
        name="author"
        content={settings.companyName || "Coherent Tours"}
      />
    </Helmet>
  );
}
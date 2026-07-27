import { Helmet } from "react-helmet-async";

export default function SEO({
  title,

  description,

  image,
}) {
  return (
    <Helmet>
      <title>{title}| Hussein Mboya Tours</title>

      <meta name="description" content={description} />

      <meta property="og:title" content={title} />

      <meta property="og:description" content={description} />

      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
}

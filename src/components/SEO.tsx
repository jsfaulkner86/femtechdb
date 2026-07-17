import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  ogType?: string;
  image?: string;
}

const BASE_URL = "https://femtechdb.com";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

export const SEO = ({ title, description, path, ogType = "website", image }: SEOProps) => {
  const url = `${BASE_URL}${path}`;
  const imageUrl = image ?? DEFAULT_IMAGE;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={imageUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
};

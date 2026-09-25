// Production domain (kept in sync with src/app/sitemap.js and layout.js).
const BASE_URL = "https://studiospace.co.in";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

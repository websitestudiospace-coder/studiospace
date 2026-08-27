// TODO: placeholder production domain -- swap for the real studio-splace
// domain before launch (kept in sync with src/app/sitemap.js).
const BASE_URL = "https://studiospace.example.com";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

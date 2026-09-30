// TEMPORARY (pre-launch holding page): block all crawling. At launch, restore
// `allow: "/"` and the sitemap line (see git history).
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}

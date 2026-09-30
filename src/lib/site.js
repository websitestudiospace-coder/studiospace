import { toCloudinaryUrl } from "@/lib/projects";

// Production origin -- used for metadataBase (layout.js), robots.js and
// sitemap.js.
export const SITE_URL = "https://studiospace.co.in";

// Share cards want a ~1.91:1 JPEG; project photos are full-size WebP on
// Cloudinary, so ask Cloudinary for that crop directly. Anything that isn't a
// Cloudinary URL (a Sanity CDN image, a local /images path) is returned as-is.
export function toShareImage(src) {
  if (!src) return null;
  return src.replace(
    /(res\.cloudinary\.com\/[^/]+\/image\/upload\/)/,
    "$1c_fill,g_auto,w_1200,h_630/f_jpg/q_auto/"
  );
}

// Site-wide Open Graph / Twitter image. No purpose-made social image exists
// yet, so a project photo stands in -- swap this when the client provides
// one. Every page that sets its own `openGraph`/`twitter` metadata has to
// repeat `images` (Next.js doesn't deep-merge those objects from the layout).
export const DEFAULT_SHARE_IMAGE = toShareImage(
  toCloudinaryUrl("/images/projects/the-modern-eclectic-home/3H4A2226-1.webp")
);

// Responsive <img> props for Cloudinary-hosted photos used in plain <img>
// tags (the project gallery and the About page's belief cards, whose boxes
// are sized by JS/CSS rather than next/image). The stored URLs point at
// full-size originals (~2400px); this offers Cloudinary-resized variants with
// automatic format/quality so the browser downloads roughly what the box
// needs. Non-Cloudinary sources (e.g. Sanity's CDN) are returned unchanged.
// Client-safe: no Node imports, unlike @/lib/projects.
const SRCSET_WIDTHS = [400, 640, 960, 1280, 1600];
const CLOUDINARY_UPLOAD_RE = /(res\.cloudinary\.com\/[^/]+\/image\/upload\/)/;

function resized(src, width) {
  return src.replace(CLOUDINARY_UPLOAD_RE, `$1c_limit,w_${width},f_auto,q_auto/`);
}

export function responsiveImageProps(src, sizes) {
  if (!src || !CLOUDINARY_UPLOAD_RE.test(src)) return { src };
  return {
    src: resized(src, 960),
    srcSet: SRCSET_WIDTHS.map((w) => `${resized(src, w)} ${w}w`).join(", "),
    sizes,
  };
}

// !! DO NOT RUN THIS against the current checkout. !!
// It rebuilds scripts/photo-manifest.json from the local photo files in
// public/images/projects/<slug>/, but those files were deleted after the
// move to Cloudinary -- the folders now hold only video files. Running it
// would write EMPTY photo lists for every project, and it would also discard
// the hand-edited gallery orders, `coverFile` and `wide` flags. Edit the
// manifest by hand instead (see ARCHITECTURE.md).
//
// Kept only as a record of how the manifest was first generated.
// Usage (only with a full local WebP mirror): node scripts/build-photo-manifest.js

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const PROJECTS_DIR = path.join(__dirname, "..", "public", "images", "projects");
const OUT_FILE = path.join(__dirname, "photo-manifest.json");

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const RESERVED_BASENAMES = new Set(["video-poster.jpg", "video-poster.png", "video-poster.webp"]);
const POSTER_CANDIDATES = ["video-poster.webp", "video-poster.jpg", "video-poster.png"];

// Natural sort (so "2" comes before "10").
function naturalCompare(a, b) {
  const chunk = /(\d+)|(\D+)/g;
  const ax = a.match(chunk) ?? [];
  const bx = b.match(chunk) ?? [];
  const len = Math.min(ax.length, bx.length);
  for (let i = 0; i < len; i++) {
    const an = Number(ax[i]);
    const bn = Number(bx[i]);
    if (!Number.isNaN(an) && !Number.isNaN(bn)) {
      if (an !== bn) return an - bn;
    } else if (ax[i] !== bx[i]) {
      return ax[i] < bx[i] ? -1 : 1;
    }
  }
  return ax.length - bx.length;
}

function walkImages(dir, baseDir = dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walkImages(full, baseDir));
    } else if (
      IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) &&
      !RESERVED_BASENAMES.has(entry.name.toLowerCase())
    ) {
      results.push(path.relative(baseDir, full).split(path.sep).join("/"));
    }
  }
  return results;
}

function listProjectSlugs() {
  return fs
    .readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

async function buildSlugEntry(slug) {
  const dir = path.join(PROJECTS_DIR, slug);
  const files = walkImages(dir).sort(naturalCompare);

  const photos = [];
  for (const file of files) {
    const metadata = await sharp(path.join(dir, file)).metadata();
    photos.push({ file, width: metadata.width ?? null, height: metadata.height ?? null });
  }

  const hasVideo = fs.existsSync(path.join(dir, "video.mp4"));
  const posterFile = POSTER_CANDIDATES.find((name) => fs.existsSync(path.join(dir, name))) ?? null;

  return { photos, hasVideo, posterFile };
}

async function main() {
  const slugs = listProjectSlugs();
  const manifest = {};

  for (const slug of slugs) {
    manifest[slug] = await buildSlugEntry(slug);
    console.log(`${slug}: ${manifest[slug].photos.length} photo(s), video=${manifest[slug].hasVideo}, poster=${manifest[slug].posterFile ?? "none"}`);
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\nManifest written to scripts/photo-manifest.json`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

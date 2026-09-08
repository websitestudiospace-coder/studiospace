// Converts every JPEG/PNG in a single public/images/projects/<slug>/ folder
// to WebP in place, then moves the raw originals out of the served path into
// media-source/projects/<slug>/ (gitignored, matches the existing convention
// used for raw source videos) so nothing served gets deleted, just relocated.
//
// Usage:
//   node scripts/convert-to-webp.js <slug>
//
// Only image files are touched -- video.mp4 and any file already in .webp
// format are left alone. Run one slug at a time; this intentionally has no
// --all mode so each project's output can be reviewed before moving on.

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const PROJECTS_DIR = path.join(__dirname, "..", "public", "images", "projects");
const BACKUP_ROOT = path.join(__dirname, "..", "media-source", "projects");

const CONVERTIBLE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);
const MAX_DIMENSION = 2400;
const WEBP_QUALITY = 82;

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
}

// Mirrors src/lib/projects.js's walkImages -- a project's photos can live in
// a nested subfolder (e.g. the-neo-colonial-home/Photos/), not just directly
// under the project's own folder, so this has to recurse the same way that
// resolver does or a whole subfolder silently never gets converted.
function walkConvertibleFiles(dir, baseDir = dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walkConvertibleFiles(full, baseDir));
    } else if (CONVERTIBLE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      results.push(path.relative(baseDir, full));
    }
  }
  return results;
}

async function convertOne(slug, relativePath) {
  const dir = path.join(PROJECTS_DIR, slug);
  const inputPath = path.join(dir, relativePath);
  const ext = path.extname(relativePath);
  const outputPath = path.join(dir, relativePath.slice(0, -ext.length) + ".webp");

  const originalSize = fs.statSync(inputPath).size;

  await sharp(inputPath)
    .rotate() // auto-orient from EXIF, then strip the orientation tag
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toFile(outputPath);

  const newSize = fs.statSync(outputPath).size;

  const backupPath = path.join(BACKUP_ROOT, slug, relativePath);
  fs.mkdirSync(path.dirname(backupPath), { recursive: true });
  fs.renameSync(inputPath, backupPath);

  return { filename: relativePath, originalSize, newSize };
}

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error("Usage: node scripts/convert-to-webp.js <slug>");
    process.exit(1);
  }

  const dir = path.join(PROJECTS_DIR, slug);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.error(`No such project folder: public/images/projects/${slug}`);
    process.exit(1);
  }

  const files = walkConvertibleFiles(dir).sort();

  console.log(`Converting ${files.length} file(s) in ${slug} to WebP (max ${MAX_DIMENSION}px, q${WEBP_QUALITY})\n`);

  const results = [];
  let totalOriginal = 0;
  let totalNew = 0;

  for (const filename of files) {
    const result = await convertOne(slug, filename);
    const pct = 100 - (result.newSize / result.originalSize) * 100;
    console.log(
      `  ${filename} -> ${path.basename(filename, path.extname(filename))}.webp  ` +
        `${formatBytes(result.originalSize)} -> ${formatBytes(result.newSize)} (-${pct.toFixed(0)}%)`
    );
    results.push(result);
    totalOriginal += result.originalSize;
    totalNew += result.newSize;
  }

  const totalPct = 100 - (totalNew / totalOriginal) * 100;
  console.log(
    `\n${slug}: ${formatBytes(totalOriginal)} -> ${formatBytes(totalNew)} (-${totalPct.toFixed(1)}%)`
  );
  console.log(`Originals moved to media-source/projects/${slug}/`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

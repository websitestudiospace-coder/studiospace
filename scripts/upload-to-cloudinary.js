// Uploads public/images/projects/<slug>/* to Cloudinary and records each
// local path -> Cloudinary URL in scripts/cloudinary-url-map.json, which
// @/lib/projects uses to resolve image URLs.
//
// Usage:
//   node --env-file=.env.local scripts/upload-to-cloudinary.js <slug>   # one project
//   node --env-file=.env.local scripts/upload-to-cloudinary.js --all    # every project folder
//
// Needs CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET
// (see .env.example). Uploads are signed locally and sent with `curl`: Node's
// HTTP client timed out during a TLS renegotiation on the original network.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

const PROJECTS_DIR = path.join(__dirname, "..", "public", "images", "projects");
const MAP_FILE = path.join(__dirname, "cloudinary-url-map.json");
const CLOUDINARY_ROOT = "sp-ace/projects";
const UPLOAD_TIMEOUT_SECONDS = 120;

const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".webm"]);
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

// Cloudinary's Free plan rejects assets over 10MB, and only after the whole
// body has been sent, so oversized files are skipped locally. Compress them
// first (scripts/convert-to-webp.js).
const FREE_PLAN_MAX_BYTES = 10 * 1024 * 1024;

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(
      `Missing ${name}. Run this script with your env file loaded, e.g.\n` +
        `  node --env-file=.env.local scripts/upload-to-cloudinary.js <slug>`
    );
    process.exit(1);
  }
  return value;
}

const CLOUD_NAME = requireEnv("CLOUDINARY_CLOUD_NAME");
const API_KEY = requireEnv("CLOUDINARY_API_KEY");
const API_SECRET = requireEnv("CLOUDINARY_API_SECRET");

function loadExistingMap() {
  if (!fs.existsSync(MAP_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(MAP_FILE, "utf8"));
  } catch {
    console.warn(`Warning: couldn't parse existing ${MAP_FILE}, starting fresh.`);
    return {};
  }
}

function listProjectSlugs() {
  return fs
    .readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

// Recurses, since some projects keep photos in a subfolder (e.g.
// the-neo-colonial-home/Photos/).
function walkFiles(dir, baseDir = dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walkFiles(full, baseDir));
    } else if (entry.isFile()) {
      results.push(path.relative(baseDir, full));
    }
  }
  return results;
}

function listFilesForSlug(slug) {
  const dir = path.join(PROJECTS_DIR, slug);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    throw new Error(`No such project folder: public/images/projects/${slug}`);
  }
  return walkFiles(dir).sort();
}

function resourceTypeFor(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (VIDEO_EXTENSIONS.has(ext)) return "video";
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  return null; // unsupported -- skip
}

// Cloudinary signed-upload rule: sha1 of every non-file param (sorted by
// key, "key=value" joined with "&") with the API secret appended.
function signParams(params) {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto.createHash("sha1").update(sorted + API_SECRET).digest("hex");
}

async function uploadOne(slug, relativePath) {
  const filePath = path.join(PROJECTS_DIR, slug, relativePath);
  const ext = path.extname(relativePath);
  const baseName = path.basename(relativePath, ext);
  const relDir = path.dirname(relativePath).split(path.sep).join("/");
  const resourceType = resourceTypeFor(relativePath);
  const displayName = relativePath.split(path.sep).join("/");

  if (!resourceType) {
    console.log(`  skip (unsupported type): ${displayName}`);
    return null;
  }

  const { size } = fs.statSync(filePath);
  if (size > FREE_PLAN_MAX_BYTES) {
    console.log(
      `  skip (${(size / 1024 / 1024).toFixed(1)}MB > 10MB Free-plan cap): ${displayName}`
    );
    return { skippedOversized: true };
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signParamsObj = {
    folder: relDir === "." ? `${CLOUDINARY_ROOT}/${slug}` : `${CLOUDINARY_ROOT}/${slug}/${relDir}`,
    public_id: baseName,
    timestamp,
    overwrite: "true",
    use_filename: "true",
    unique_filename: "false",
  };
  const signature = signParams(signParamsObj);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
  const args = [
    "-sS",
    "--max-time",
    String(UPLOAD_TIMEOUT_SECONDS),
    url,
    "-F",
    `file=@${filePath}`,
    "-F",
    `folder=${signParamsObj.folder}`,
    "-F",
    `public_id=${signParamsObj.public_id}`,
    "-F",
    `timestamp=${signParamsObj.timestamp}`,
    "-F",
    `overwrite=${signParamsObj.overwrite}`,
    "-F",
    `use_filename=${signParamsObj.use_filename}`,
    "-F",
    `unique_filename=${signParamsObj.unique_filename}`,
    "-F",
    `api_key=${API_KEY}`,
    "-F",
    `signature=${signature}`,
  ];

  const { stdout } = await execFileAsync("curl", args, { maxBuffer: 10 * 1024 * 1024 });
  const result = JSON.parse(stdout);

  if (result.error) {
    throw new Error(result.error.message || result.message || "Unknown Cloudinary error");
  }

  const localKey = path
    .relative(path.join(__dirname, ".."), filePath)
    .split(path.sep)
    .join("/");

  console.log(`  ${displayName} -> ${result.secure_url}`);
  return { localKey, url: result.secure_url };
}

async function uploadSlug(slug, map) {
  const files = listFilesForSlug(slug);
  console.log(`\n${slug} (${files.length} files)`);

  // Clear this slug's old entries first so renamed/deleted files don't leave
  // stale keys behind.
  const keyPrefix = `public/images/projects/${slug}/`;
  for (const key of Object.keys(map)) {
    if (key.startsWith(keyPrefix)) delete map[key];
  }

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const relativePath of files) {
    const displayName = relativePath.split(path.sep).join("/");
    try {
      const entry = await uploadOne(slug, relativePath);
      if (entry?.skippedOversized) {
        skipped += 1;
      } else if (entry) {
        map[entry.localKey] = entry.url;
        uploaded += 1;
      }
    } catch (err) {
      failed += 1;
      const reason = err?.message || err?.error?.message || JSON.stringify(err);
      console.error(`  FAILED: ${displayName} -- ${reason}`);
    }
  }

  console.log(`${slug}: ${uploaded} uploaded, ${skipped} skipped (oversized), ${failed} failed`);
  return { uploaded, skipped, failed };
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error(
      "Usage:\n" +
        "  node --env-file=.env.local scripts/upload-to-cloudinary.js <slug>\n" +
        "  node --env-file=.env.local scripts/upload-to-cloudinary.js --all"
    );
    process.exit(1);
  }

  const slugs = arg === "--all" ? listProjectSlugs() : [arg];
  console.log(`Uploading ${slugs.length} project folder(s): ${slugs.join(", ")}`);

  const map = loadExistingMap();
  let totalUploaded = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const slug of slugs) {
    const { uploaded, skipped, failed } = await uploadSlug(slug, map);
    totalUploaded += uploaded;
    totalSkipped += skipped;
    totalFailed += failed;
    // Save after every folder, not just at the end, so a crash partway
    // through --all doesn't lose already-uploaded progress.
    fs.writeFileSync(MAP_FILE, JSON.stringify(map, null, 2) + "\n");
  }

  console.log(
    `\nDone. ${totalUploaded} uploaded, ${totalSkipped} skipped (oversized), ${totalFailed} failed.`
  );
  if (totalSkipped > 0) {
    console.log(
      `${totalSkipped} file(s) exceed the Cloudinary Free plan's 10MB/asset cap and were not attempted -- upgrade the plan or compress those files before re-running.`
    );
  }
  console.log(`Mapping written to scripts/cloudinary-url-map.json`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

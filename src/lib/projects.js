import fs from "node:fs";
import path from "node:path";
import { PROJECTS } from "@/data/projects";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const PROJECTS_DIR = path.join(process.cwd(), "public", "images", "projects");
const VIDEOS_DIR = path.join(process.cwd(), "public", "videos", "projects");

// Reserved filenames within a project folder that are never gallery photos,
// even though "video-poster.jpg" matches IMAGE_EXTENSIONS -- it's the poster
// frame for that project's video.mp4, not a photo to list.
const RESERVED_BASENAMES = new Set(["video-poster.jpg", "video-poster.png"]);

// Splits "Photos/9.jpg" into alternating text/number chunks so "9" sorts
// before "10" instead of alphabetically after it, and compares number
// chunks numerically -- matches how a person would order a numbered set of
// client photos.
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

// Reads just enough of a JPEG's marker stream to find its SOF (start-of-frame)
// segment, which carries the pixel width/height -- no decode needed. Handles
// the baseline/progressive SOF variants (0xC0-0xCF, excluding the non-frame
// 0xC4/0xC8/0xCC markers) that camera JPEGs actually use.
function readJpegSize(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    if (marker === 0xda) break; // start-of-scan -- no SOF found before actual image data
    const isSOF =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    const segmentLength = buffer.readUInt16BE(offset + 2);
    if (isSOF) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + segmentLength;
  }
  return null;
}

function readPngSize(buffer) {
  const isPng =
    buffer.length >= 24 &&
    buffer.readUInt32BE(0) === 0x89504e47 &&
    buffer.readUInt32BE(4) === 0x0d0a1a0a;
  if (!isPng) return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

// Build-time only (generateStaticParams pre-renders every project), so a
// full sync file read per photo is cheap relative to the rest of the build.
function getImageDimensions(fullPath) {
  try {
    const buffer = fs.readFileSync(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    const size = ext === ".png" ? readPngSize(buffer) : readJpegSize(buffer);
    if (!size || !size.width || !size.height) return null;
    return size;
  } catch {
    return null;
  }
}

function walkImages(dir, baseDir = dir) {
  if (!fs.existsSync(dir)) return [];
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

// Natural-sorted filenames only -- no file content is read, so this is cheap
// even against folders full of huge, unoptimized source photos. Use this
// wherever only the cover (first photo's path) is needed, e.g. the grid and
// "next project" link; reserve listProjectPhotos (below) for the single
// detail page actually being rendered, since only that one needs real
// per-photo dimensions for its gallery layout.
function listProjectPhotoFilenames(slug) {
  const dir = path.join(PROJECTS_DIR, slug);
  return walkImages(dir).sort(naturalCompare);
}

// Returns every photo in a project's folder, natural-sorted, each carrying
// its own pixel dimensions/orientation so the gallery can lay out mixed
// portrait/landscape rows without any client-side measuring.
function listProjectPhotos(slug) {
  const dir = path.join(PROJECTS_DIR, slug);
  return walkImages(dir)
    .sort(naturalCompare)
    .map((file) => {
      const dimensions = getImageDimensions(path.join(dir, file));
      const orientation =
        dimensions && dimensions.width < dimensions.height ? "portrait" : "landscape";
      return {
        file,
        src: `/images/projects/${slug}/${file}`,
        width: dimensions?.width ?? null,
        height: dimensions?.height ?? null,
        orientation,
      };
    });
}

// Groups a project's gallery photos (cover already excluded by the caller)
// into rows matching the mixed layout brief: consecutive portraits cluster
// side-by-side (up to 3 per row), while each landscape gets its own
// full-width row -- whatever the actual folder contents produce, no fixed
// pattern assumed.
function groupGalleryRows(photos) {
  const rows = [];
  let portraitRun = [];

  const flushPortraits = () => {
    if (portraitRun.length === 0) return;
    rows.push({ type: "portrait-group", photos: portraitRun });
    portraitRun = [];
  };

  for (const photo of photos) {
    if (photo.orientation === "landscape") {
      flushPortraits();
      rows.push({ type: "landscape", photo });
    } else {
      portraitRun.push(photo);
      if (portraitRun.length === 3) flushPortraits();
    }
  }
  flushPortraits();

  return rows;
}

// A compressed project video is expected at
// public/images/projects/<slug>/video.mp4, alongside that project's photos
// -- with an optional video-poster.jpg (same folder) used as the
// reduced-motion/mobile fallback frame. Falls back to the older
// public/videos/projects/<slug>.mp4 convention if that's ever used instead.
// Until either exists for a project, the video section is skipped entirely.
function getProjectVideo(slug) {
  const projectDir = path.join(PROJECTS_DIR, slug);
  const coLocatedVideo = path.join(projectDir, "video.mp4");
  if (fs.existsSync(coLocatedVideo)) {
    const posterPath = path.join(projectDir, "video-poster.jpg");
    return {
      src: `/images/projects/${slug}/video.mp4`,
      poster: fs.existsSync(posterPath) ? `/images/projects/${slug}/video-poster.jpg` : null,
    };
  }

  const legacyVideo = path.join(VIDEOS_DIR, `${slug}.mp4`);
  if (fs.existsSync(legacyVideo)) {
    return { src: `/videos/projects/${slug}.mp4`, poster: null };
  }

  return null;
}

export function getAllProjects() {
  return PROJECTS.map((project) => {
    const [firstFile] = listProjectPhotoFilenames(project.slug);
    return {
      ...project,
      cover: firstFile ? `/images/projects/${project.slug}/${firstFile}` : null,
    };
  });
}

export function getProjectBySlug(slug) {
  const meta = PROJECTS.find((project) => project.slug === slug);
  if (!meta) return null;

  const photos = listProjectPhotos(slug);
  const [cover, ...galleryPhotos] = photos;

  return {
    ...meta,
    cover: cover?.src ?? null,
    galleryRows: groupGalleryRows(galleryPhotos),
    video: getProjectVideo(slug),
  };
}

// Cycles to the next project after `slug` in the roster, wrapping back to
// the first -- used by the "Next Project" link at the bottom of the detail
// page. Returns a lightweight {slug, name, cover} rather than the full
// project (no gallery/video needed for a preview link).
export function getNextProject(slug) {
  const index = PROJECTS.findIndex((project) => project.slug === slug);
  if (index === -1) return null;
  const next = PROJECTS[(index + 1) % PROJECTS.length];
  const [firstFile] = listProjectPhotoFilenames(next.slug);
  return {
    slug: next.slug,
    name: next.name,
    cover: firstFile ? `/images/projects/${next.slug}/${firstFile}` : null,
  };
}

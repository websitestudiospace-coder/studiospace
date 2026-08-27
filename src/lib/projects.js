import fs from "node:fs";
import path from "node:path";
import { PROJECTS } from "@/data/projects";

const VIDEOS_DIR = path.join(process.cwd(), "public", "videos", "projects");
const CLOUDINARY_MAP_PATH = path.join(process.cwd(), "scripts", "cloudinary-url-map.json");
const PHOTO_MANIFEST_PATH = path.join(process.cwd(), "scripts", "photo-manifest.json");

let cloudinaryMapCache = null;
function loadCloudinaryMap() {
  if (cloudinaryMapCache) return cloudinaryMapCache;
  try {
    cloudinaryMapCache = JSON.parse(fs.readFileSync(CLOUDINARY_MAP_PATH, "utf8"));
  } catch {
    cloudinaryMapCache = {};
  }
  return cloudinaryMapCache;
}

// Every project photo/video is mirrored to Cloudinary (see
// scripts/upload-to-cloudinary.js, keyed by this same "public/images/..."
// path), so this swaps a local path for its Cloudinary URL wherever the
// upload map has one, falling back to the local path itself if the map has
// no entry (e.g. a file added after the last upload pass hasn't run yet).
function toCloudinaryUrl(localSrc) {
  if (!localSrc) return localSrc;
  const map = loadCloudinaryMap();
  return map[`public${localSrc}`] ?? localSrc;
}

let photoManifestCache = null;
function loadPhotoManifest() {
  if (photoManifestCache) return photoManifestCache;
  try {
    photoManifestCache = JSON.parse(fs.readFileSync(PHOTO_MANIFEST_PATH, "utf8"));
  } catch {
    photoManifestCache = {};
  }
  return photoManifestCache;
}

// Every project's photo list, natural sort order, and pixel dimensions come
// from this build-time manifest (see scripts/build-photo-manifest.js) rather
// than walking public/images/projects/<slug> on disk -- the local WebP
// mirror was deleted once Cloudinary hosting was confirmed working
// end-to-end, so this manifest (built from that mirror right before it was
// removed) is now the only remaining record of what each project's gallery
// contains, what order it goes in, and how it should lay out.
function getManifestEntry(slug) {
  return loadPhotoManifest()[slug] ?? { photos: [], hasVideo: false, posterFile: null };
}

function listProjectPhotoFilenames(slug) {
  return getManifestEntry(slug).photos.map((photo) => photo.file);
}

// Returns every photo in a project's folder, natural-sorted, each carrying
// its own pixel dimensions/orientation so the gallery can lay out mixed
// portrait/landscape rows without any client-side measuring.
function listProjectPhotos(slug) {
  return getManifestEntry(slug).photos.map(({ file, width, height }) => ({
    file,
    src: toCloudinaryUrl(`/images/projects/${slug}/${file}`),
    width: width ?? null,
    height: height ?? null,
    orientation: width && height && width < height ? "portrait" : "landscape",
  }));
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
// -- with an optional video-poster image (same folder) used as the
// reduced-motion/mobile fallback frame. Presence of both is recorded in the
// photo manifest (see getManifestEntry) rather than checked on disk, for the
// same reason listProjectPhotos reads from it. Falls back to the older
// public/videos/projects/<slug>.mp4 convention if that's ever used instead.
// Until either exists for a project, the video section is skipped entirely.
function getProjectVideo(slug) {
  const entry = getManifestEntry(slug);
  if (entry.hasVideo) {
    return {
      src: toCloudinaryUrl(`/images/projects/${slug}/video.mp4`),
      poster: entry.posterFile ? toCloudinaryUrl(`/images/projects/${slug}/${entry.posterFile}`) : null,
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
      cover: firstFile ? toCloudinaryUrl(`/images/projects/${project.slug}/${firstFile}`) : null,
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
    cover: firstFile ? toCloudinaryUrl(`/images/projects/${next.slug}/${firstFile}`) : null,
  };
}

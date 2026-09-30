import fs from "node:fs";
import path from "node:path";
import { PROJECTS } from "@/data/projects";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

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

// Swaps a local "/images/..." path for its Cloudinary URL using the upload
// map (scripts/cloudinary-url-map.json, written by upload-to-cloudinary.js).
// Falls back to the local path if the file hasn't been uploaded yet.
// Exported for non-project images uploaded the same way (e.g. Contact hero).
export function toCloudinaryUrl(localSrc) {
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

// Photo lists, order and pixel dimensions for the original projects come from
// scripts/photo-manifest.json, not the filesystem: the local photo files were
// removed once Cloudinary hosting was in place, so the manifest is the only
// record of each gallery. Edit it by hand to reorder (see ARCHITECTURE.md).
function getManifestEntry(slug) {
  return loadPhotoManifest()[slug] ?? { photos: [], hasVideo: false, posterFile: null };
}

// Every photo for a project, in manifest order, with pixel dimensions.
function listProjectPhotos(slug) {
  return getManifestEntry(slug).photos.map(({ file, width, height, wide }) => ({
    file,
    src: toCloudinaryUrl(`/images/projects/${slug}/${file}`),
    width: width ?? null,
    height: height ?? null,
    // Optional manifest flag: show this photo in a two-column landscape
    // cell in ProjectGallery instead of the standard portrait cell.
    wide: wide === true,
  }));
}

// Splits a project's photos into its cover (listing card, hero, Next Project
// preview, share image) and its gallery. Default: the first photo is the
// cover and is left out of the gallery. If the manifest entry sets
// `coverFile`, that photo is the cover and the whole `photos` list is the
// gallery, cover included at its listed position.
function splitCoverAndGallery(slug) {
  const photos = listProjectPhotos(slug);
  const { coverFile } = getManifestEntry(slug);
  if (coverFile) {
    const cover = photos.find((photo) => photo.file === coverFile) ?? photos[0] ?? null;
    return { cover, galleryPhotos: photos };
  }
  const [cover = null, ...galleryPhotos] = photos;
  return { cover, galleryPhotos };
}

// Project video: public/images/projects/<slug>/video.mp4 (served from
// Cloudinary) with an optional poster, both recorded in the manifest. Falls
// back to public/videos/projects/<slug>.mp4. No video -> section skipped.
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

// Cloudinary URL for one photo by its manifest filename (including any
// subfolder, e.g. "Photos/3.webp"), for use elsewhere on the site.
export function getProjectPhoto(slug, file) {
  const match = getManifestEntry(slug).photos.find((photo) => photo.file === file);
  return match ? toCloudinaryUrl(`/images/projects/${slug}/${file}`) : null;
}

const SANITY_PROJECT_QUERY = `*[_type == "project"] | order(coalesce(order, 9999) asc, _createdAt desc) {
  "slug": slug.current,
  name,
  description,
  longDescription,
  typology,
  location,
  squareFootage,
  completion,
  coverImage,
  "galleryPhotos": galleryPhotos[] {
    ...,
    "dimensions": asset->metadata.dimensions
  },
  videoUrl,
}`;

// Projects added through /studio live entirely in Sanity (photos and video
// uploaded there). Returns [] if Sanity is unreachable so /projects still
// renders the static projects.
async function fetchSanityProjects() {
  try {
    const docs = await client.fetch(SANITY_PROJECT_QUERY);
    return docs
      .filter((doc) => doc.slug && doc.coverImage)
      .map((doc) => ({
        slug: doc.slug,
        name: doc.name,
        description: doc.description,
        longDescription: doc.longDescription,
        typology: doc.typology ?? null,
        location: doc.location ?? null,
        squareFootage: doc.squareFootage ?? null,
        completion: doc.completion ?? null,
        cover: urlFor(doc.coverImage).width(1600).url(),
        galleryPhotos: (doc.galleryPhotos ?? []).map((image) => ({
          src: urlFor(image).width(1920).url(),
          width: image.dimensions?.width ?? null,
          height: image.dimensions?.height ?? null,
        })),
        video: doc.videoUrl ? { src: doc.videoUrl, poster: null } : null,
      }));
  } catch (err) {
    console.error("[projects] Sanity fetch failed, showing static projects only:", err);
    return [];
  }
}

export async function getAllProjects() {
  const staticProjects = PROJECTS.map((project) => ({
    ...project,
    cover: splitCoverAndGallery(project.slug).cover?.src ?? null,
  }));
  const sanityProjects = await fetchSanityProjects();
  return [...staticProjects, ...sanityProjects];
}

export async function getProjectBySlug(slug) {
  const meta = PROJECTS.find((project) => project.slug === slug);
  if (meta) {
    const { cover, galleryPhotos } = splitCoverAndGallery(slug);
    return {
      ...meta,
      cover: cover?.src ?? null,
      galleryPhotos,
      video: getProjectVideo(slug),
    };
  }

  const sanityProjects = await fetchSanityProjects();
  return sanityProjects.find((project) => project.slug === slug) ?? null;
}

// The project after `slug` in the combined roster, wrapping to the first.
// Used by the "Next Project" link.
export async function getNextProject(slug) {
  const all = await getAllProjects();
  const index = all.findIndex((project) => project.slug === slug);
  if (index === -1) return null;
  const next = all[(index + 1) % all.length];
  return { slug: next.slug, name: next.name, cover: next.cover };
}

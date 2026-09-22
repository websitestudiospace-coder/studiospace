// Schema for a client-addable project (case study). Kept independent of the
// existing hand-tuned PROJECTS array in @/data/projects -- that array and
// its Cloudinary/photo-manifest pipeline stay exactly as they are (see
// @/lib/projects for why: no risk to the 7 existing, already-polished
// projects). A project created here just gets merged alongside them on the
// /projects grid, so the client doesn't need a developer to run any scripts
// to add a new one -- photos/video upload directly through Sanity's own
// asset storage.
export default {
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Project name",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "slug",
      title: "URL slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "description",
      title: "Short description",
      description: "Shown on the /projects grid card and as the page's meta description.",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    },
    {
      name: "longDescription",
      title: "Full description",
      description: "Shown on the project's own detail page.",
      type: "text",
      rows: 8,
      validation: (Rule) => Rule.required(),
    },
    { name: "typology", title: "Typology", type: "string", description: "e.g. Residential" },
    { name: "location", title: "Location", type: "string", description: "e.g. Mumbai" },
    { name: "squareFootage", title: "Square footage", type: "string", description: "e.g. 1,500 sq. ft." },
    { name: "completion", title: "Completion year", type: "string", description: "e.g. 2026" },
    {
      name: "coverImage",
      title: "Cover photo",
      description: "Shown on the /projects grid card and as the top of the detail page.",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "galleryPhotos",
      title: "Gallery photos",
      description: "The rest of the project's photos, in the order they should appear.",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    },
    {
      name: "videoUrl",
      title: "Video URL (optional)",
      description: "A direct link to an .mp4 (e.g. a Cloudinary or YouTube-hosted file), not an upload -- keeps large video files out of Sanity's storage quota.",
      type: "url",
    },
    {
      name: "order",
      title: "Display order",
      description: "Lower numbers show first. Projects without a number show after ordered ones, newest first.",
      type: "number",
    },
  ],
  preview: {
    select: { title: "name", subtitle: "location", media: "coverImage" },
  },
};

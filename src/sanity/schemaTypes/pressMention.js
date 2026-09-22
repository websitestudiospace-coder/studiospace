// Schema for a client-addable press mention. Kept independent of the
// existing hand-tuned PRESS_ITEMS array in @/data/press -- that array stays
// exactly as it is (see @/lib/press for why: no risk to the 5 existing
// mentions). A press mention created here just gets merged alongside them
// on the home page's Press carousel and the /media grid, so the client
// doesn't need a developer to touch code to add a new one. Mirrors
// project.js's own shape/conventions.
export default {
  name: "pressMention",
  title: "Press Mention",
  type: "document",
  fields: [
    {
      name: "publication",
      title: "Publication",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "date",
      title: "Date",
      description: "Free text, matching the existing format, e.g. \"April 2026\" -- not a date picker.",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "headline",
      title: "Headline",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    },
    {
      name: "url",
      title: "Article URL",
      type: "url",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "order",
      title: "Display order",
      description: "Lower numbers show first. Mentions without a number show after ordered ones, newest first.",
      type: "number",
    },
  ],
  preview: {
    select: { title: "headline", subtitle: "publication" },
  },
};

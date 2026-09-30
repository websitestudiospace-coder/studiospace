// Sanity schema for a press mention the client adds through /studio, merged
// with the static list in @/data/press.
const pressMention = {
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

export default pressMention;

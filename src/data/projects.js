// Static project roster. Photo lists, cover image, gallery layout, and video
// availability are all resolved from the filesystem at request time (see
// @/lib/projects) so dropping/removing files in public/images just works
// without touching this file.
//
// description/longDescription/typology/location/squareFootage/completion are
// ALL PLACEHOLDER copy pending real project details from the client -- see
// each project's `description` field, which is flagged inline. Swapping them
// is a one-line text change once real copy lands.
const PLACEHOLDER_LONG_DESCRIPTION = `A full write-up for this project is on its way and will describe the brief, the site conditions, and the material and spatial decisions that shaped the design.

Expect a short narrative here -- how the family lives, what the site asked for, and how the plan and material palette responded to both. Structural and material specifics (stone, timber, metalwork) will be named directly once confirmed.

The finished copy will run roughly this length, eight to ten lines, closing on how the completed home reads today.`;

export const PROJECTS = [
  {
    slug: "the-modern-eclectic-home",
    name: "The Modern Eclectic Home",
    description: "The Modern Eclectic Home is a Bangalore-based project — full project details are on their way.",
    longDescription: PLACEHOLDER_LONG_DESCRIPTION,
    typology: "Residential",
    location: "Bangalore",
    squareFootage: "2,400 sq. ft.",
    completion: "2025",
  },
  {
    slug: "the-modern-neo-classical-home",
    name: "The Modern Neo Classical Home",
    description: "The Modern Neo Classical Home is a Bangalore-based project — full project details are on their way.",
    longDescription: PLACEHOLDER_LONG_DESCRIPTION,
    typology: "Residential",
    location: "Bangalore",
    squareFootage: "3,100 sq. ft.",
    completion: "2024",
  },
  {
    slug: "the-modern-transitional-home",
    name: "The Modern Transitional Home",
    description: "The Modern Transitional Home is a Bangalore-based project — full project details are on their way.",
    longDescription: PLACEHOLDER_LONG_DESCRIPTION,
    typology: "Residential",
    location: "Bangalore",
    squareFootage: "2,800 sq. ft.",
    completion: "2024",
  },
  {
    slug: "the-modern-classical-home",
    name: "The Modern Classical Home",
    description: "The Modern Classical Home is a Bangalore-based project — full project details are on their way.",
    longDescription: PLACEHOLDER_LONG_DESCRIPTION,
    typology: "Residential",
    location: "Bangalore",
    squareFootage: "3,600 sq. ft.",
    completion: "2023",
  },
  {
    slug: "the-modern-organic-home",
    name: "The Modern Organic Home",
    description: "The Modern Organic Home is a Bangalore-based project — full project details are on their way.",
    longDescription: PLACEHOLDER_LONG_DESCRIPTION,
    typology: "Residential",
    location: "Bangalore",
    squareFootage: "2,400 sq. ft.",
    completion: "2025",
  },
  {
    slug: "the-neo-colonial-home",
    name: "The Neo Colonial Home",
    description: "The Neo Colonial Home is a Bangalore-based project — full project details are on their way.",
    longDescription: PLACEHOLDER_LONG_DESCRIPTION,
    typology: "Residential",
    location: "Bangalore",
    squareFootage: "4,200 sq. ft.",
    completion: "2023",
  },
  // Working title as provided by the client -- doesn't match the "The [Style]
  // Home" naming pattern of the other projects, kept as-is rather than
  // renamed to fit.
  {
    slug: "the-shraddhas-thinkpad",
    name: "Shraddha's Thinkpad",
    description: "Shraddha's Thinkpad is a Bangalore-based project — full project details are on their way.",
    longDescription: PLACEHOLDER_LONG_DESCRIPTION,
    typology: "Residential",
    location: "Bangalore",
    squareFootage: "2,200 sq. ft.",
    completion: "2025",
  },
];

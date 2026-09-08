// Real press mentions, most recent first (per the client's brief). Publish
// dates for the first 4 are TODOs -- this environment's WebFetch can't reach
// architectureplusdesign.in or architecturaldigest.in (both return "unable to
// fetch"), so rather than guess a month/year, those are left flagged for
// whoever can confirm them (check the article's own byline/dateline).
//
// Single source of truth for both the home page's Press carousel
// (src/components/home/Press.jsx) and the /media page's grid
// (src/components/media/MediaGrid.jsx) -- moved here from Press.jsx, which
// used to define this array locally, so neither place risks drifting out
// of sync with a duplicated copy.
export const PRESS_ITEMS = [
  {
    publication: "Architecture+Design",
    // TODO: unconfirmed publish date -- WebFetch couldn't reach
    // architectureplusdesign.in from this environment. Confirm from the
    // article's own byline before shipping.
    date: "Date TBC",
    headline:
      "The Modern Organic Home by Studio SP_ACE functions as the truest kind of medicine — a space built entirely around stillness",
    url: "https://www.architectureplusdesign.in/architecture/the-modern-organic-home-by-studio-sp_ace-functions-as-the-truest-kind-of-medicine-a-space-built-entirely-around-stillness/",
  },
  {
    publication: "Architectural Digest India",
    // TODO: unconfirmed publish date -- WebFetch couldn't reach
    // architecturaldigest.in from this environment. Confirm from the
    // article's own byline before shipping.
    date: "Date TBC",
    headline: "This builder-grade apartment in Bengaluru is transformed into an oasis of zen",
    url: "https://www.architecturaldigest.in/story/this-builder-grade-apartment-in-bengaluru-is-transformed-into-an-oasis-of-zen-studio-sp-ace/",
  },
  {
    publication: "Architectural Digest India",
    // TODO: unconfirmed publish date -- see note above.
    date: "Date TBC",
    headline: "In this Bengaluru apartment, wanderlust and heritage are woven into the design",
    url: "https://www.architecturaldigest.in/story/in-this-bengaluru-apartment-wanderlust-and-heritage-are-woven-into-the-design-studio-space/",
  },
  {
    publication: "Architectural Digest India",
    // TODO: unconfirmed publish date -- see note above.
    date: "Date TBC",
    headline: "This Hyderabad home echoes timeless Indian design for a modern family",
    // Tracking query params (?utm_source=...) stripped per the brief.
    url: "https://www.architecturaldigest.in/story/this-hyderabad-home-echoes-timeless-indian-design-for-a-modern-family/",
  },
  {
    publication: "Elle Decor",
    date: "December 2023",
    headline:
      "A hymn of teak wood and cane: Studio SP_ACE conjures up a modern eclectic home at the edge of Bengaluru's Turahalli Forest",
    url: "https://elledecor.in/hymn-teak-wood-cane-studio-sp_ace-conjures-modern-eclectic-home-edge-bangalores-turahalli-forest/",
  },
];

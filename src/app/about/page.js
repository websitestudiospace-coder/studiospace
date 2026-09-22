import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import AboutHero from "@/components/about/AboutHero";
import MeetFounders from "@/components/about/MeetFounders";
import WhatWeBelieve from "@/components/about/WhatWeBelieve";
import IndiaMap from "@/components/about/IndiaMap";
import { getProjectPhoto } from "@/lib/projects";

// WhatWeBelieve's scroll-stack needs a real photo per belief, but it's a
// "use client" component (GSAP/Lenis/DOM refs) and getProjectPhoto() reads
// the filesystem (via Node's fs, see src/lib/projects.js) -- server-only,
// can't run inside a client component. Resolved here instead (this page is
// a server component) and passed down as plain prop URLs, same pattern
// src/app/projects/[slug]/page.js already uses for ProjectDetail.
//
// Client-requested photo swap (2026-09-15) -- all 6 replaced with a new,
// specific set of project photos, same order as given. Each was checked
// against scripts/cloudinary-url-map.json first: every one of the 6
// already had a real getProjectPhoto()-resolvable entry (confirmed by
// matching Cloudinary version ids), including the two the client's own
// URLs looked hardest to resolve (the-modern-classical-home/8 and
// the-modern-neo-classical-home/IMG_1391) -- those two were just missing
// their ".webp" extension and carrying inline transform params
// (c_limit,w_1920/f_auto/q_auto) plus a Cloudinary Media Library UI
// tracking param (?_a=BAVT+OE80) copy-pasted from the console, not a sign
// they were unmapped. So every entry below goes through getProjectPhoto()
// like the rest of this array, with no plain-string fallback needed. Each
// photo was actually opened/viewed (not guessed from its filename) before
// writing its alt text below.
const BELIEF_IMAGES = [
  {
    src: getProjectPhoto("the-neo-colonial-home", "Photos/3.webp"),
    alt: "A cream sofa with a dark brown velvet cushion beside a wood pedestal coffee table, striped rug, and mercury-glass pendant lights",
  },
  {
    src: getProjectPhoto("the-shraddhas-thinkpad", "_H4A3764.webp"),
    alt: "A view through an arched hallway with a patterned bench and wall shelves, opening onto a dining area with a wrought-iron chandelier and a framed tapestry",
  },
  {
    src: getProjectPhoto("the-modern-classical-home", "8.webp"),
    alt: "A sage-green built-in shelving unit displaying curated curios and a model ship, behind a terracotta sofa and dark wood console table",
  },
  {
    src: getProjectPhoto("the-modern-transitional-home", "9.webp"),
    alt: "A round dining table framed by arched wood-and-glass doors, with a built-in blue cabinet and living room beyond",
  },
  {
    src: getProjectPhoto("the-modern-organic-home", "4.webp"),
    alt: "A living room with a rust velvet curved sofa and a round marble coffee table on sculptural wood legs, beneath boucle pendant lights",
  },
  {
    src: getProjectPhoto("the-modern-neo-classical-home", "IMG_1391.webp"),
    alt: "A blush channel-tufted bed against wood paneling, with a cream boucle armchair and striped rug in the foreground",
  },
];

// TODO: placeholder OG/Twitter share image, same as layout.js -- Next.js
// doesn't deep-merge nested `openGraph`/`twitter` objects, so a page that
// sets its own must repeat `images` or it silently loses the root layout's
// default. Swap for a purpose-made image from the client before launch.
const DEFAULT_OG_IMAGE = "/images/projects/the-modern-eclectic-home/3H4A2226-1.webp";

const ABOUT_DESCRIPTION =
  "Meet the founders behind Studio SP_ACE and discover our approach to architecture and interior design built around the way you live.";

export const metadata = {
  title: "About | Studio SP_ACE",
  description: ABOUT_DESCRIPTION,
  openGraph: {
    title: "About | Studio SP_ACE",
    description: ABOUT_DESCRIPTION,
    siteName: "Studio SP_ACE",
    images: [{ url: DEFAULT_OG_IMAGE }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About | Studio SP_ACE",
    description: ABOUT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function AboutPage() {
  return (
    <>
      {/* No `lightHero` -- AboutHero's enhanced (desktop) branch is now a
          full-bleed photo directly under Nav, same as Home's hero, so this
          page uses the same default transparent-then-solid Nav behavior
          Home does (see Nav.jsx's own `solid` logic). AboutHero carries its
          own top gradient for cream-nav-text legibility over that photo
          (see that file) -- the same fix Home's Hero.jsx already uses. Note:
          the mobile/reduced-motion fallback below md doesn't have an
          equivalent full-bleed hero (a deliberate AboutHero constraint, see
          that file's own comment on why the pinned sequence has no mobile
          equivalent) -- its top-of-page background is plain CREAM, so a
          transparent Nav is genuinely low-contrast there for the same brief
          initial-scroll window. Flagged, not silently patched: fixing it for
          real would mean giving the mobile fallback its own full-bleed hero
          treatment, which is out of this task's scope. */}
      <Nav />
      {/* StudioDescription's copy now lives inside AboutHero's own scroll
          sequence (see that component) -- the section itself is retired but
          its file is kept around in case its content needs referencing back.
          OurStory's copy also now lives inside AboutHero's StudioCopy (now
          split back into two labeled sub-sections, "About Studio SP_ACE"
          and "Our Story" -- see AboutHero.jsx) -- unlike StudioDescription,
          OurStory.jsx itself has been deleted rather than kept around,
          since the client wants this content consolidated, not just
          visually adjacent. */}
      <AboutHero />
      <MeetFounders />
      <WhatWeBelieve beliefImages={BELIEF_IMAGES} />
      <IndiaMap />
      <Footer />
    </>
  );
}

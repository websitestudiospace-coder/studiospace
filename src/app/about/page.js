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
// 6 beliefs now (the real "SP_ACE Way"), reusing the original 4 photos
// (reassigned to whichever new belief they pair with best) plus 2 newly
// picked photos -- viewed via the media-source originals before picking,
// not guessed from filenames -- for "A Little Unexpected" (the neo-classical
// bedroom's blush velvet bed and patterned throw against traditional wood
// paneling -- literally an unexpected colour/detail worked into a more
// traditional room) and "Making Ideas Work" (the transitional home's
// arched wood-and-glass door plus lattice screen and built-in cabinetry --
// custom joinery standing in for the "figuring it out on site" idea).
const BELIEF_IMAGES = [
  {
    src: getProjectPhoto("the-neo-colonial-home", "Photos/3.webp"),
    alt: "A warm, layered living room styled for everyday living",
  },
  {
    src: getProjectPhoto("the-modern-eclectic-home", "3H4A2309.webp"),
    alt: "Ornate hardware detail on a vintage-styled dresser",
  },
  {
    src: getProjectPhoto("the-modern-classical-home", "3.webp"),
    alt: "A clean, balanced living room composition",
  },
  {
    src: getProjectPhoto("the-modern-neo-classical-home", "IMG_1380.webp"),
    alt: "A blush velvet bed and patterned throw against traditional wood paneling",
  },
  {
    src: getProjectPhoto("the-modern-transitional-home", "6.webp"),
    alt: "A custom arched wood-and-glass door and lattice screen",
  },
  {
    src: getProjectPhoto("the-modern-organic-home", "3.webp"),
    alt: "Textural materials and natural finishes in a Studio SP_ACE living space",
  },
];

// TODO: placeholder OG/Twitter share image, same as layout.js -- Next.js
// doesn't deep-merge nested `openGraph`/`twitter` objects, so a page that
// sets its own must repeat `images` or it silently loses the root layout's
// default. Swap for a purpose-made image from the client before launch.
const DEFAULT_OG_IMAGE = "/images/projects/the-modern-eclectic-home/3H4A2226-1.webp";

export const metadata = {
  title: "About | Studio SP_ACE",
  description:
    "Meet the studio behind Studio SP_ACE -- architecture and interior design built around the way you live.",
  openGraph: {
    title: "About | Studio SP_ACE",
    description:
      "Meet the studio behind Studio SP_ACE -- architecture and interior design built around the way you live.",
    siteName: "Studio SP_ACE",
    images: [{ url: DEFAULT_OG_IMAGE }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About | Studio SP_ACE",
    description:
      "Meet the studio behind Studio SP_ACE -- architecture and interior design built around the way you live.",
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

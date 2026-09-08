import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import MediaHero from "@/components/media/MediaHero";
import MediaGrid from "@/components/media/MediaGrid";
import { getProjectPhoto } from "@/lib/projects";

// MediaHero is a "use client" component (GSAP/DOM refs) and
// getProjectPhoto() reads scripts/photo-manifest.json + cloudinary-url-map
// off disk via Node's fs -- server-only, can't run inside a client
// component. Resolved here instead (this page is a server component) and
// passed down as a plain prop URL, same pattern contact/page.js's own
// CAREERS_PLACEHOLDER_PHOTO and about/page.js's beliefImages already use.
//
// TODO: placeholder hero photo -- swap for the client's chosen photo if
// they want a different one. Picked (not guessed from a filename --
// downloaded and actually viewed first, same discipline the Careers-photo
// pick used) specifically because it's a real, existing gallery photo not
// already used elsewhere on the site for a different purpose (not a
// project cover, not one of WhatWeBelieve's 6 belief photos, not the
// Careers photo) -- a wide, well-lit dining/living space with arched
// glass doors, which reads well letterboxed across a full-bleed hero band.
// Its top band was measured (not assumed) before picking it: ~4.8:1
// contrast against cream Nav text with no gradient at all, ~7.2:1 once
// this hero's own gradient is added -- comfortably legible, unlike
// AboutHero's photo which needed a dedicated top-gradient fix for the
// same reason (see PROJECT_STATUS.md's twenty-sixth-session entry).
const MEDIA_HERO_PHOTO = {
  src: getProjectPhoto("the-modern-transitional-home", "9.webp"),
  alt: "A round dining table with navy chairs beneath a wood-beamed ceiling, opening through arched glass doors into a living room with built-in blue cabinetry",
};

// TODO: placeholder OG/Twitter share image, same as layout.js -- Next.js
// doesn't deep-merge nested `openGraph`/`twitter` objects, so a page that
// sets its own must repeat `images` or it silently loses the root layout's
// default. Swap for a purpose-made image from the client before launch.
const DEFAULT_OG_IMAGE = "/images/projects/the-modern-eclectic-home/3H4A2226-1.webp";

export const metadata = {
  title: "Media | Studio SP_ACE",
  description:
    "Studio SP_ACE's work as featured in architecture and design press.",
  openGraph: {
    title: "Media | Studio SP_ACE",
    description:
      "Studio SP_ACE's work as featured in architecture and design press.",
    siteName: "Studio SP_ACE",
    images: [{ url: DEFAULT_OG_IMAGE }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Media | Studio SP_ACE",
    description:
      "Studio SP_ACE's work as featured in architecture and design press.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function MediaPage() {
  return (
    <>
      {/* No `lightHero` -- MediaHero is now a full-bleed photo hero (like
          Home/Projects/Contact), not the plain-CREAM version that used to
          need the solid-from-y=0 nav treatment. Default transparent-then-
          solid Nav behavior applies, same as those other photo-hero pages. */}
      <Nav />
      <MediaHero heroPhoto={MEDIA_HERO_PHOTO} />
      <MediaGrid />
      <Footer />
    </>
  );
}

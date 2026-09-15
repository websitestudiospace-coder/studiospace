import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import ContactContent from "@/components/contact/ContactContent";
import { getProjectPhoto } from "@/lib/projects";

// Was "/images/contact/8.webp" via a flat toCloudinaryUrl() call (that
// source file/folder no longer exists under public/images/contact/ at
// all -- confirmed on disk). The Cloudinary-hosted copy itself still
// resolved fine (200, real bytes, not a broken/stale mapping), but ~35-40%
// of the frame was a large wall-mounted TV with its screen off -- a real
// black rectangle in the actual photo, not a rendering bug -- which is
// exactly what read as "broken" once that portrait 1601x2400 shot got
// force-cropped into this wide full-bleed banner via object-cover. Swapped
// for a real, existing gallery photo instead (viewed full-size before
// picking it, not chosen from its filename) -- landscape-oriented (so a
// wide object-cover crop doesn't fight its own aspect ratio the way the
// old portrait shot did), warm/editorial, no blown-out highlights in the
// lower third where the white "Let's Talk" heading + dark gradient sit,
// and not already used elsewhere on the site (checked against about/
// page.js's BELIEF_IMAGES and this file's own CAREERS_PLACEHOLDER_PHOTO
// below -- same "no duplicate imagery with a different meaning"
// reasoning that comment already documents).
const CONTACT_HERO_PHOTO = {
  src: getProjectPhoto("the-modern-transitional-home", "19.webp"),
  alt: "A warm, arched bedroom nook with a cane-panelled wardrobe, terracotta bedding, and pleated bedside lamps, opening onto a neutral linen sofa",
};

// TODO: placeholder photo -- swap for the client's chosen Careers photo
// when provided. This is a real, existing gallery photo (not a fabricated
// asset), picked and viewed (downloaded + inspected, not guessed from its
// filename) specifically because it wasn't already used anywhere else on
// the site -- WhatWeBelieve's 6 belief photos each pull from a different
// project, and this one (Shraddha's Thinkpad) isn't among them, so this
// avoids the same image showing up twice with two different meanings.
const CAREERS_PLACEHOLDER_PHOTO = {
  src: getProjectPhoto("the-shraddhas-thinkpad", "_H4A3801.webp"),
  alt: "A green-cabinetry kitchen framed through an arched doorway",
};

// TODO: placeholder OG/Twitter share image, same as layout.js -- Next.js
// doesn't deep-merge nested `openGraph`/`twitter` objects, so a page that
// sets its own must repeat `images` or it silently loses the root layout's
// default. Swap for a purpose-made image from the client before launch.
const DEFAULT_OG_IMAGE = "/images/projects/the-modern-eclectic-home/3H4A2226-1.webp";

export const metadata = {
  title: "Contact | Studio SP_ACE",
  description: "Get in touch with Studio SP_ACE to start your architecture and interior design project.",
  openGraph: {
    title: "Contact | Studio SP_ACE",
    description: "Get in touch with Studio SP_ACE to start your architecture and interior design project.",
    siteName: "Studio SP_ACE",
    images: [{ url: DEFAULT_OG_IMAGE }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Studio SP_ACE",
    description: "Get in touch with Studio SP_ACE to start your architecture and interior design project.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function ContactPage() {
  return (
    <>
      <Nav />
      <ContactContent heroPhoto={CONTACT_HERO_PHOTO} careersPhoto={CAREERS_PLACEHOLDER_PHOTO} />
      <Footer />
    </>
  );
}

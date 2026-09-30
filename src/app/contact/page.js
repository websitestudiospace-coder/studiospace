import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import ContactContent from "@/components/contact/ContactContent";
import { getProjectPhoto } from "@/lib/projects";
import { DEFAULT_SHARE_IMAGE } from "@/lib/site";

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
// page.js's BELIEF_IMAGES -- no duplicate imagery with a different
// meaning).
const CONTACT_HERO_PHOTO = {
  src: getProjectPhoto("the-modern-transitional-home", "19.webp"),
  alt: "A warm, arched bedroom nook with a cane-panelled wardrobe, terracotta bedding, and pleated bedside lamps, opening onto a neutral linen sofa",
};

export const metadata = {
  title: "Contact | Studio SP_ACE",
  description: "Get in touch with Studio SP_ACE to start your architecture and interior design project.",
  openGraph: {
    title: "Contact | Studio SP_ACE",
    description: "Get in touch with Studio SP_ACE to start your architecture and interior design project.",
    siteName: "Studio SP_ACE",
    images: [{ url: DEFAULT_SHARE_IMAGE }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Studio SP_ACE",
    description: "Get in touch with Studio SP_ACE to start your architecture and interior design project.",
    images: [DEFAULT_SHARE_IMAGE],
  },
};

export default function ContactPage() {
  return (
    <>
      <Nav />
      <ContactContent heroPhoto={CONTACT_HERO_PHOTO} />
      {/* The enquiry form already sits just above as "Design With Us". */}
      <Footer hideForm />
    </>
  );
}

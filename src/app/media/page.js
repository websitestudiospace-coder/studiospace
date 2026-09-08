import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import MediaHero from "@/components/media/MediaHero";
import MediaGrid from "@/components/media/MediaGrid";

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
      {/* lightHero, not the default transparent-then-solid nav Projects/Home
          use -- MediaHero (unlike ProjectsHero) has no full-bleed photo
          behind it, just plain CREAM at y=0. A transparent nav with cream
          logo/text would be invisible against that until the visitor
          scrolls past ~80px -- this is exactly the case Nav.jsx's own
          `lightHero` prop exists for (see that file's comment). */}
      <Nav lightHero />
      <MediaHero />
      <MediaGrid />
      <Footer />
    </>
  );
}

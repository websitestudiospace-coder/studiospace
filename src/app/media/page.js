import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import MediaHero from "@/components/media/MediaHero";
import MediaGrid from "@/components/media/MediaGrid";
import { getProjectPhoto } from "@/lib/projects";
import { getAllPressItems } from "@/lib/press";
import { DEFAULT_SHARE_IMAGE } from "@/lib/site";

// Hero photo, resolved here because getProjectPhoto() reads the filesystem
// and MediaHero is a client component. A gallery photo not used elsewhere
// on the site; its top is dark enough for the cream Nav text.
const MEDIA_HERO_PHOTO = {
  src: getProjectPhoto("the-modern-transitional-home", "9.webp"),
  alt: "A round dining table with navy chairs beneath a wood-beamed ceiling, opening through arched glass doors into a living room with built-in blue cabinetry",
};

export const metadata = {
  title: "Media | Studio SP_ACE",
  description:
    "Studio SP_ACE's work as featured in architecture and design press.",
  openGraph: {
    title: "Media | Studio SP_ACE",
    description:
      "Studio SP_ACE's work as featured in architecture and design press.",
    siteName: "Studio SP_ACE",
    images: [{ url: DEFAULT_SHARE_IMAGE }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Media | Studio SP_ACE",
    description:
      "Studio SP_ACE's work as featured in architecture and design press.",
    images: [DEFAULT_SHARE_IMAGE],
  },
};

export default async function MediaPage() {
  const pressItems = await getAllPressItems();

  return (
    <>
      {/* Default transparent-then-solid Nav over the photo hero. */}
      <Nav />
      <MediaHero heroPhoto={MEDIA_HERO_PHOTO} />
      <MediaGrid items={pressItems} />
      <Footer />
    </>
  );
}

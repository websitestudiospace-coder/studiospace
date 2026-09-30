import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import AboutHero from "@/components/about/AboutHero";
import MeetFounders from "@/components/about/MeetFounders";
import WhatWeBelieve from "@/components/about/WhatWeBelieve";
import IndiaMap from "@/components/about/IndiaMap";
import { getProjectPhoto } from "@/lib/projects";
import { DEFAULT_SHARE_IMAGE } from "@/lib/site";

// Belief-card photos, resolved here because getProjectPhoto() reads the
// filesystem and WhatWeBelieve is a client component. Chosen by the client.
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

const ABOUT_DESCRIPTION =
  "Meet the founders behind Studio SP_ACE and discover our approach to architecture and interior design built around the way you live.";

export const metadata = {
  title: "About | Studio SP_ACE",
  description: ABOUT_DESCRIPTION,
  openGraph: {
    title: "About | Studio SP_ACE",
    description: ABOUT_DESCRIPTION,
    siteName: "Studio SP_ACE",
    images: [{ url: DEFAULT_SHARE_IMAGE }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About | Studio SP_ACE",
    description: ABOUT_DESCRIPTION,
    images: [DEFAULT_SHARE_IMAGE],
  },
};

export default function AboutPage() {
  return (
    <>
      {/* Default transparent-then-solid Nav: AboutHero carries its own dark
          top band. Known gap: on mobile the top of the page is cream, so the
          transparent Nav has low contrast for the first ~80px of scroll. */}
      <Nav />
      <AboutHero />
      <MeetFounders />
      <WhatWeBelieve beliefImages={BELIEF_IMAGES} />
      <IndiaMap />
      <Footer />
    </>
  );
}

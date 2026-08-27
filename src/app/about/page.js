import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import AboutHero from "@/components/about/AboutHero";
import StudioDescription from "@/components/about/StudioDescription";
import MeetFounders from "@/components/about/MeetFounders";
import WhatWeBelieve from "@/components/about/WhatWeBelieve";
import IndiaMap from "@/components/about/IndiaMap";
import FinalCTA from "@/components/about/FinalCTA";

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
      <Nav lightHero />
      <AboutHero />
      <StudioDescription />
      <MeetFounders />
      <WhatWeBelieve />
      <IndiaMap />
      <FinalCTA />
      <Footer />
    </>
  );
}

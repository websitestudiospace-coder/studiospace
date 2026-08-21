import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import AboutHero from "@/components/about/AboutHero";
import StudioDescription from "@/components/about/StudioDescription";
import MeetFounders from "@/components/about/MeetFounders";
import WhatWeBelieve from "@/components/about/WhatWeBelieve";
import IndiaMap from "@/components/about/IndiaMap";
import FinalCTA from "@/components/about/FinalCTA";

export const metadata = {
  title: "About | Studio SP_ACE",
  description:
    "Meet the studio behind Studio SP_ACE -- architecture and interior design built around the way you live.",
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

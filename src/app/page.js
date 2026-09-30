import Nav from "@/components/home/Nav";
import HeroQuoteTransition from "@/components/home/HeroQuoteTransition";
import Quote from "@/components/home/Quote";
import About from "@/components/home/About";
import Projects from "@/components/home/Projects";
import Instagram from "@/components/home/Instagram";
import Press from "@/components/home/Press";
import Footer from "@/components/home/Footer";
import { getAllPressItems } from "@/lib/press";
import { DEFAULT_SHARE_IMAGE } from "@/lib/site";

// Matches layout.js's own SITE_DESCRIPTION (pulled from home/About.jsx's
// real positioning copy) -- the homepage is meant to carry the site's main
// brand title/description, same as the root layout's own default.
const HOME_DESCRIPTION =
  "Based in Bangalore and working pan-India, Studio SP_ACE is a bespoke interior design studio offering a complete journey from design to execution.";

export const metadata = {
  title: "Studio SP_ACE | Architecture & Interior Design",
  description: HOME_DESCRIPTION,
  openGraph: {
    title: "Studio SP_ACE | Architecture & Interior Design",
    description: HOME_DESCRIPTION,
    siteName: "Studio SP_ACE",
    images: [{ url: DEFAULT_SHARE_IMAGE }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Studio SP_ACE | Architecture & Interior Design",
    description: HOME_DESCRIPTION,
    images: [DEFAULT_SHARE_IMAGE],
  },
};

export default async function Home() {
  const pressItems = await getAllPressItems();

  return (
    <>
      <Nav />
      <HeroQuoteTransition />
      <Quote />
      <About />
      <Projects />
      <Instagram />
      <Press items={pressItems} />
      <Footer />
    </>
  );
}

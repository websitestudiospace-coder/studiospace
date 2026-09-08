import Nav from "@/components/home/Nav";
import HeroQuoteTransition from "@/components/home/HeroQuoteTransition";
import Quote from "@/components/home/Quote";
import About from "@/components/home/About";
import Projects from "@/components/home/Projects";
import Instagram from "@/components/home/Instagram";
import Press from "@/components/home/Press";
import Footer from "@/components/home/Footer";

// TODO: placeholder OG/Twitter share image, same as layout.js -- Next.js
// doesn't deep-merge nested `openGraph`/`twitter` objects, so a page that
// sets its own must repeat `images` or it silently loses the root layout's
// default. Swap for a purpose-made image from the client before launch.
const DEFAULT_OG_IMAGE = "/images/projects/the-modern-eclectic-home/3H4A2226-1.webp";

export const metadata = {
  title: "Studio SP_ACE | Architecture & Interior Design",
  description:
    "Studio SP_ACE is an architecture and interior design studio crafting spaces that feel like you.",
  openGraph: {
    title: "Studio SP_ACE | Architecture & Interior Design",
    description:
      "Studio SP_ACE is an architecture and interior design studio crafting spaces that feel like you.",
    siteName: "Studio SP_ACE",
    images: [{ url: DEFAULT_OG_IMAGE }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Studio SP_ACE | Architecture & Interior Design",
    description:
      "Studio SP_ACE is an architecture and interior design studio crafting spaces that feel like you.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function Home() {
  return (
    <>
      <Nav />
      <HeroQuoteTransition />
      <Quote />
      <About />
      <Projects />
      <Instagram />
      <Press />
      <Footer />
    </>
  );
}

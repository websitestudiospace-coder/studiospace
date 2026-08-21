import Nav from "@/components/home/Nav";
import HeroQuoteTransition from "@/components/home/HeroQuoteTransition";
import Quote from "@/components/home/Quote";
import About from "@/components/home/About";
import Projects from "@/components/home/Projects";
import Instagram from "@/components/home/Instagram";
import Press from "@/components/home/Press";
import Footer from "@/components/home/Footer";

export const metadata = {
  title: "Studio SP_ACE | Architecture & Interior Design",
  description:
    "Studio SP_ACE is an architecture and interior design studio crafting spaces that feel like you.",
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

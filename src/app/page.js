import Nav from "@/components/home/Nav";
import HeroQuoteTransition from "@/components/home/HeroQuoteTransition";
import Quote from "@/components/home/Quote";
import About from "@/components/home/About";
import Projects from "@/components/home/Projects";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <HeroQuoteTransition />
      <Quote />
      <About />
      <Projects />
      <Footer />
    </>
  );
}

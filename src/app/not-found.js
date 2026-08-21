import Link from "next/link";
import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";

const CREAM = "#F7EFE4";
const INK = "#2B2622";
const MAROON = "#6E1F24";

export const metadata = {
  title: "Page Not Found | Studio SP_ACE",
  description: "The page you're looking for doesn't exist or has been moved.",
};

export default function NotFound() {
  return (
    <>
      <Nav />
      <section
        className="flex w-full flex-col items-center justify-center px-6 py-40 text-center"
        style={{ backgroundColor: INK, minHeight: "80vh" }}
      >
        <p
          className="text-sm uppercase tracking-[0.3em]"
          style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.55 }}
        >
          404
        </p>
        <h1
          className="mt-4 text-4xl md:text-6xl"
          style={{ fontFamily: "var(--font-agatho)", color: CREAM }}
        >
          Page Not Found
        </h1>
        <p
          className="mt-6 max-w-md text-sm md:text-base"
          style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.65 }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-10 inline-block px-6 py-2.5 text-[14px] uppercase tracking-[0.15em] transition-opacity duration-200 ease-out hover:opacity-90"
          style={{ backgroundColor: MAROON, color: CREAM, fontFamily: "var(--font-manrope)" }}
        >
          Back to Home
        </Link>
      </section>
      <Footer />
    </>
  );
}

import Image from "next/image";

// TEMPORARY holding page until the official launch (October 7). Every other
// route except /studio is redirected here by src/proxy.js, and robots.txt
// disallows crawling. To launch, revert the "coming soon" commit(s) on this
// branch: this file, src/proxy.js, src/app/robots.js and SiteChrome.jsx.

const CREAM = "#F7EFE4";
const INK = "#2B2622";
const MAROON = "#6E1F24";

export const metadata = {
  title: "Studio SP_ACE | Launching October 7",
  description: "Studio SP_ACE, architecture and interior design studio. Launching October 7.",
  robots: { index: false, follow: false },
};

export default function ComingSoon() {
  return (
    <main
      className="flex min-h-[100svh] w-full flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: CREAM }}
    >
      <h1 className="w-full max-w-[520px]">
        <Image
          src="/logos/logo.png"
          alt="Studio SP_ACE — Architecture | Interiors"
          width={1600}
          height={716}
          priority
          sizes="(max-width: 600px) 85vw, 520px"
          className="h-auto w-full"
        />
      </h1>

      <div className="mt-12 h-px w-16 md:mt-16" style={{ backgroundColor: MAROON }} aria-hidden="true" />

      <p
        className="mt-10 text-[28px] uppercase md:mt-12 md:text-[40px]"
        style={{ fontFamily: "var(--font-agatho)", color: INK, letterSpacing: "0.04em", lineHeight: 1.15 }}
      >
        Launching October 7
      </p>
      <p
        className="mt-4 text-sm md:text-base"
        style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.7 }}
      >
        Something beautiful is coming.
      </p>
    </main>
  );
}

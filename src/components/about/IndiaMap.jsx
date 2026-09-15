"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "@/components/ui/Button";
import IndiaWorkMap from "@/components/about/IndiaWorkMap";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const INK = "#2B2622";

// Custom illustrated map, not a real Google Maps embed -- that approach
// (the shared IndiaMapEmbed component) is still used as-is on the Contact
// page for the studio's actual address, but the client wanted this
// About-page section to instead be a minimal, illustrated India outline
// with the three states the studio actually works in (Maharashtra,
// Telangana, Karnataka) highlighted -- see IndiaWorkMap.jsx. This file
// still just wires the About page's own heading/caption/CTA and one-shot
// reveal animation around whichever map lives in mapWrapRef.

export default function IndiaMap() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const mapWrapRef = useRef(null);
  const captionRef = useRef(null);
  const ctaRef = useRef(null);
  const reduceMotion = useReducedMotion(true);

  // One-shot reveal, not scroll-scrubbed -- the iframe's own map content
  // has no scroll-tied animation at all, this just fades the section in as
  // a whole once as it enters the viewport (same Phase-3 idiom as Press/
  // Footer/the rest of this page).
  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        gsap.set(headingRef.current, { opacity: 0, y: 24 });
        gsap.set(mapWrapRef.current, { opacity: 0, y: 24 });
        gsap.set(captionRef.current, { opacity: 0, y: 24 });
        if (ctaRef.current) gsap.set(ctaRef.current, { opacity: 0, y: 16 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });

        tl.to(headingRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0);
        tl.to(mapWrapRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0.15);
        tl.to(captionRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.35);
        if (ctaRef.current) {
          tl.to(ctaRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.45);
        }
      }, sectionRef);

      return () => ctx.revert();
    },
    [],
    !reduceMotion
  );

  return (
    <section ref={sectionRef} className="w-full py-16 md:py-24" style={{ backgroundColor: CREAM }}>
      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-12 px-6 md:grid-cols-[2fr_3fr] md:items-start md:gap-16 md:px-16">
        {/* Text column -- decorative line, two-line heading, italic
            subtext, then the CTA, all stacked and left-aligned (matches
            the reference's left column). Stacks above the map column on
            mobile via the grid-cols-1 default above. */}
        <div className="flex flex-col">
          <div className="h-px w-12" style={{ backgroundColor: INK, opacity: 0.3 }} />

          <h2
            ref={headingRef}
            className="mt-6 text-[32px] md:text-[48px]"
            style={{ fontFamily: "var(--font-agatho)", color: INK, lineHeight: 1.05 }}
          >
            <span className="block">Our Work</span>
            <span className="block">Across India</span>
          </h2>

          <p
            ref={captionRef}
            className="mt-6 text-base md:text-lg"
            style={{
              fontFamily: "var(--font-agatho)",
              fontStyle: "italic",
              color: INK,
              opacity: 0.75,
            }}
          >
            Spaces we&apos;ve designed across the country.
          </p>

          <div ref={ctaRef} className="mt-8">
            <Button href="/projects" variant="primary">
              View All Projects
            </Button>
          </div>
        </div>

        {/* Map column -- wider (3fr vs 2fr) than the text column, per the
            reference's ~60-65% split. */}
        <div ref={mapWrapRef} className="w-full">
          <IndiaWorkMap />
        </div>
      </div>
    </section>
  );
}

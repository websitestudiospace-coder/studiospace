"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "@/components/ui/Button";
import IndiaMapEmbed from "@/components/shared/IndiaMapEmbed";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const INK = "#2B2622";

// Real embedded Google Maps, not a custom-built map/label layout -- the
// map itself now lives in the shared IndiaMapEmbed component (also used
// map-only, no heading/caption/CTA, on the Contact page); this file wires
// in the About page's own heading/caption/CTA and reveal animation around
// it.

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
      <div className="mx-auto flex w-full flex-col items-center px-6 text-center md:px-16">
        <h2
          ref={headingRef}
          className="text-[32px] md:text-[48px]"
          style={{ fontFamily: "var(--font-agatho)", color: INK }}
        >
          Where We Work
        </h2>
      </div>

      {/* Full-width relative to the viewport, not this page's usual
          max-w-[1100px] content column. Fixed height (not a bare
          height:100%, which has nothing to bound itself against) so the
          map reads clearly without dominating the page, shorter on mobile
          where there's less room to spare. */}
      <div ref={mapWrapRef} className="mt-10 w-full md:mt-12">
        <IndiaMapEmbed />
      </div>

      <div className="mx-auto flex w-full flex-col items-center px-6 text-center md:px-16">
        <p
          ref={captionRef}
          className="mt-8 text-sm md:text-base"
          style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.65 }}
        >
          Serving clients across India for architecture and interior design
          projects.
        </p>

        <div ref={ctaRef} className="mt-8">
          <Button href="/projects" variant="primary">
            View All Projects
          </Button>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "@/components/ui/Button";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const INK = "#2B2622";

// Real embedded Google Maps, not a custom-built map/label layout --
// replaces the earlier minimalist label-position version (which lives on,
// unchanged, as the shared LocationsMap component used by the Contact
// page; this file intentionally no longer shares implementation with it,
// since only the About page's "Where We Work" section was asked to move
// to a real map embed). This is the keyless "q=<place>&z=<zoom>&output=
// embed" pattern -- no API key, no Google My Maps account -- which drops
// Google's own marker pin exactly on Bangalore while the zoom level keeps
// the rest of India visible around it.
const MAP_EMBED_SRC = "https://www.google.com/maps?q=Bangalore,India&z=4&output=embed";

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
        <div className="relative h-[55vh] w-full overflow-hidden md:h-[75vh]">
          <iframe
            src={MAP_EMBED_SRC}
            title="Studio SP_ACE location — Bangalore, India"
            width="100%"
            height="100%"
            style={{ border: 0, filter: "sepia(0.15) grayscale(1) contrast(1.05) brightness(1.02)" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
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

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

// "Our Work Across India": heading, caption and CTA beside an illustrated map
// of the states the studio works in (IndiaWorkMap.jsx).

export default function IndiaMap() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const mapWrapRef = useRef(null);
  const captionRef = useRef(null);
  const ctaRef = useRef(null);
  const reduceMotion = useReducedMotion(true);

  // One-shot fade-in as the section enters the viewport.
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
        {/* Text column (stacks above the map on mobile). */}
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

        {/* Map column, wider than the text (3fr vs 2fr). */}
        <div ref={mapWrapRef} className="w-full">
          <IndiaWorkMap />
        </div>
      </div>
    </section>
  );
}

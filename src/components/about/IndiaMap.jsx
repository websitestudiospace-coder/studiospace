"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const INK = "#2B2622";
const MAROON = "#6E1F24";

// TODO: no real office-location data or map asset provided yet -- this is
// a deliberately abstract "location marker" treatment (radiating rings +
// pin), not a literal geographic map, so nothing here depends on precise
// map data that doesn't exist. Swap in a real map graphic/coordinates
// once the client confirms which cities/regions to show.
function LocationMark({ markRef }) {
  return (
    <div ref={markRef} className="relative flex h-[220px] w-[220px] items-center justify-center md:h-[280px] md:w-[280px]">
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full"
        style={{ border: "1px solid rgba(43,38,34,0.12)" }}
      />
      <span
        aria-hidden="true"
        className="absolute rounded-full"
        style={{ inset: "15%", border: "1px solid rgba(43,38,34,0.16)" }}
      />
      <span
        aria-hidden="true"
        className="absolute rounded-full"
        style={{ inset: "30%", border: "1px solid rgba(43,38,34,0.22)" }}
      />
      <span
        aria-hidden="true"
        className="relative flex h-4 w-4 rounded-full md:h-5 md:w-5"
        style={{ backgroundColor: MAROON }}
      />
    </div>
  );
}

export default function IndiaMap() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const markRef = useRef(null);
  const captionRef = useRef(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    // One-shot reveal (not scroll-scrubbed) -- same Phase 3 pattern as
    // Press/Footer.
    let ctx;

    const setup = () => {
      ctx = gsap.context(() => {
        gsap.set(headingRef.current, { opacity: 0, y: 24 });
        gsap.set(markRef.current, { opacity: 0, scale: 0.85 });
        gsap.set(captionRef.current, { opacity: 0, y: 24 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });

        tl.to(headingRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0);
        tl.to(
          markRef.current,
          { opacity: 1, scale: 1, duration: 0.7, ease: "power3.out" },
          0.15
        );
        tl.to(
          captionRef.current,
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
          0.3
        );
      }, sectionRef);
    };

    if (window.__preloaderDone) {
      setup();
    } else {
      window.addEventListener("preloader:complete", setup, { once: true });
    }

    return () => {
      ctx?.revert();
      window.removeEventListener("preloader:complete", setup);
    };
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className="w-full px-6 py-16 md:px-16 md:py-24"
      style={{ backgroundColor: CREAM }}
    >
      <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center text-center">
        <h2
          ref={headingRef}
          className="text-[32px] md:text-[48px]"
          style={{ fontFamily: "var(--font-agatho)", color: INK }}
        >
          Where We Work
        </h2>

        <div className="mt-12 md:mt-16">
          <LocationMark markRef={markRef} />
        </div>

        <div ref={captionRef} className="mt-8">
          <p
            className="text-lg md:text-xl"
            style={{ fontFamily: "var(--font-agatho)", color: INK }}
          >
            Bangalore, India
          </p>
          {/* TODO: placeholder service-area copy -- confirm which
              cities/regions to list once provided. */}
          <p
            className="mt-2 text-sm md:text-base"
            style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.6 }}
          >
            Serving clients across India for architecture and interior
            design projects.
          </p>
        </div>
      </div>
    </section>
  );
}

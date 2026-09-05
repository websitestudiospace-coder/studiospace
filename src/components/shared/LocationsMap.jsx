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
const MAROON = "#6E1F24";

// Replaces the earlier react-simple-maps/TopoJSON "Where We Work" section
// (client disliked the concentric-circle treatment) with a minimalist,
// Yodezeen-style locations layout: no map tiles, no country outline --
// India's shape reads purely from where the state labels themselves sit,
// each marked with a short tick above it. Bangalore (this studio's actual
// home base) is the one bold/maroon standout label, the same visual role
// the reference gives its major office cities.
//
// Positions are %x/%y within the map's own aspect-ratio box (0,0 =
// northwest corner, 100,100 = southeast), a rough first pass checked
// against India's real bounding-box shape, not pixel-exact. `minSm` marks
// the smaller/denser labels that only show at sm+ (640px) -- at narrower
// widths they crowd past legibility even after shrinking type, so they
// drop out first, keeping Bangalore and the larger/more important states
// (and their immediate neighbors) legible on small screens per the brief's
// own priority (legibility over completeness on mobile).
const LOCATIONS = [
  { name: "Jammu & Kashmir", x: 28, y: 10, minSm: true },
  { name: "Himachal Pradesh", x: 32, y: 18, minSm: true },
  { name: "Punjab", x: 25, y: 21, minSm: true },
  { name: "Uttarakhand", x: 38, y: 24, minSm: true },
  { name: "Haryana", x: 28, y: 28, minSm: true },
  { name: "Delhi", x: 32, y: 29 },
  { name: "Rajasthan", x: 17, y: 35 },
  { name: "Uttar Pradesh", x: 43, y: 35 },
  { name: "Bihar", x: 60, y: 40 },
  { name: "Sikkim", x: 71, y: 33, minSm: true },
  { name: "West Bengal", x: 67, y: 48 },
  { name: "Assam", x: 86, y: 37, minSm: true },
  { name: "Arunachal Pradesh", x: 91, y: 31, minSm: true },
  { name: "Nagaland", x: 91, y: 38, minSm: true },
  { name: "Manipur", x: 89, y: 42, minSm: true },
  { name: "Mizoram", x: 85, y: 47, minSm: true },
  { name: "Tripura", x: 80, y: 46, minSm: true },
  { name: "Meghalaya", x: 79, y: 40, minSm: true },
  { name: "Jharkhand", x: 60, y: 46, minSm: true },
  { name: "Madhya Pradesh", x: 36, y: 47 },
  { name: "Chhattisgarh", x: 47, y: 53, minSm: true },
  { name: "Gujarat", x: 11, y: 51 },
  { name: "Maharashtra", x: 27, y: 60 },
  { name: "Odisha", x: 57, y: 57 },
  { name: "Telangana", x: 40, y: 66 },
  { name: "Andhra Pradesh", x: 40, y: 73 },
  { name: "Karnataka", x: 27, y: 75 },
  { name: "Goa", x: 21, y: 74, minSm: true },
  { name: "Kerala", x: 29, y: 91 },
  { name: "Tamil Nadu", x: 37, y: 90 },
  { name: "Andaman & Nicobar Islands", x: 85, y: 88, minSm: true },
];

const BANGALORE = { name: "Bangalore, India", x: 33, y: 83 };

function LocationLabel({ location, itemRef, reduceMotion }) {
  return (
    <div
      ref={itemRef}
      className={`absolute flex -translate-x-1/2 flex-col items-center ${
        location.minSm ? "hidden sm:flex" : ""
      }`}
      style={{
        left: `${location.x}%`,
        top: `${location.y}%`,
        ...(reduceMotion ? null : { opacity: 0 }),
      }}
    >
      <span className="h-[6px] w-px" style={{ backgroundColor: INK, opacity: 0.4 }} />
      <span
        className="mt-1 whitespace-nowrap text-[8px] uppercase tracking-[0.04em] sm:text-[9px] md:text-[10px]"
        style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.55 }}
      >
        {location.name}
      </span>
    </div>
  );
}

function BangaloreLabel({ itemRef, reduceMotion }) {
  return (
    <div
      ref={itemRef}
      className="absolute flex -translate-x-1/2 flex-col items-center"
      style={{
        left: `${BANGALORE.x}%`,
        top: `${BANGALORE.y}%`,
        ...(reduceMotion ? null : { opacity: 0 }),
      }}
    >
      <span className="h-2.5 w-px" style={{ backgroundColor: MAROON }} />
      <span
        className="mt-1.5 whitespace-nowrap text-sm font-semibold sm:text-base md:text-lg"
        style={{ fontFamily: "var(--font-manrope)", color: MAROON }}
      >
        {BANGALORE.name}
      </span>
    </div>
  );
}

export default function LocationsMap({
  heading = "Where We Work",
  caption = "Serving clients across India for architecture and interior design projects.",
  showCta = false,
  ctaHref = "/projects",
  ctaLabel = "View All Projects",
}) {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const captionRef = useRef(null);
  const ctaRef = useRef(null);
  const labelRefs = useRef([]);
  const reduceMotion = useReducedMotion(true);

  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        const labels = labelRefs.current.filter(Boolean);

        gsap.set(headingRef.current, { opacity: 0, y: 24 });
        gsap.set(captionRef.current, { opacity: 0, y: 24 });
        if (ctaRef.current) gsap.set(ctaRef.current, { opacity: 0, y: 16 });
        gsap.set(labels, { opacity: 0, y: 10 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        });

        tl.to(headingRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0);
        // Reveal order follows reading order (north to south), not DOM/data
        // order -- labels are sorted by their own `y` position so the
        // stagger sweeps top-to-bottom regardless of how LOCATIONS is
        // authored.
        const sorted = labels
          .map((el, i) => ({ el, y: parseFloat(el.style.top) || 0, i }))
          .sort((a, b) => a.y - b.y);
        tl.to(
          sorted.map((s) => s.el),
          { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.02 },
          0.1
        );
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
          {heading}
        </h2>
      </div>

      {/* Full-width relative to the viewport, not this page's usual
          max-w-[1100px] content column -- the map grid itself still caps
          out at a sensible width and stays centered so the label cluster
          reads as one coherent shape rather than stretching edge-to-edge
          on an ultra-wide screen. Aspect ratio is India's own rough
          bounding-box proportions (marginally taller than wide). */}
      <div className="mx-auto mt-12 w-full max-w-[720px] px-6 md:mt-16">
        <div className="relative w-full" style={{ aspectRatio: "0.9" }}>
          {LOCATIONS.map((location, i) => (
            <LocationLabel
              key={location.name}
              location={location}
              reduceMotion={reduceMotion}
              itemRef={(el) => (labelRefs.current[i] = el)}
            />
          ))}
          <BangaloreLabel
            reduceMotion={reduceMotion}
            itemRef={(el) => (labelRefs.current[LOCATIONS.length] = el)}
          />
        </div>
      </div>

      <div className="mx-auto flex w-full flex-col items-center px-6 text-center md:px-16">
        <p
          ref={captionRef}
          className="mt-8 text-sm md:text-base"
          style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.65 }}
        >
          {caption}
        </p>

        {showCta && (
          <div ref={ctaRef} className="mt-8">
            <Button href={ctaHref} variant="primary">
              {ctaLabel}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

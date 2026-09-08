"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const INK = "#2B2622";

// Bundled Agatho font's underscore glyph is a "buy font" watermark, not a
// real underscore -- draw it as a small decorative bar instead of relying
// on the font's own glyph. Duplicated locally rather than shared/extracted
// -- this is already the third copy of this exact pattern in this codebase
// (Footer.jsx, home/Press.jsx), an established precedent for this specific
// small helper, not new debt.
function InlineWordmark({ text }) {
  return text.split("").map((char, i) =>
    char === "_" ? (
      <span
        key={i}
        aria-hidden="true"
        style={{
          display: "inline-block",
          position: "relative",
          top: "0.14em",
          width: "0.32em",
          height: "0.09em",
          backgroundColor: "currentColor",
        }}
      />
    ) : (
      char
    )
  );
}

// Deliberately NOT a pinned scroll-shrink sequence like ProjectsHero's own
// enhanced branch -- that mechanic exists specifically to make room for a
// full-bleed hero photo collapsing into a corner as the grid takes over,
// and this page has no hero photo for it to choreograph (press cards stay
// text-only, see MediaGrid.jsx). Matches Projects page conventions where
// it actually applies (same max-w-[1100px] px-6/md:px-16 container, same
// clamp(32px, 5vw, 56px) heading scale as ProjectsHero's own
// reduced-motion fallback) while using this site's simpler, far more
// common hero pattern for everything else: a one-shot fade+y reveal via
// usePreloaderGate (same shape as home/Press.jsx's own heading reveal).
export default function MediaHero() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subtextRef = useRef(null);
  const reduceMotion = useReducedMotion();

  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        gsap.set([headingRef.current, subtextRef.current], { opacity: 0, y: 24 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });

        tl.to(headingRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0);
        tl.to(subtextRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.15);
      }, sectionRef);

      return () => ctx.revert();
    },
    [],
    !reduceMotion
  );

  return (
    <section ref={sectionRef} className="w-full" style={{ backgroundColor: CREAM }}>
      <div className="mx-auto w-full max-w-[1100px] px-6 pt-16 md:px-16 md:pt-24">
        <h1
          ref={headingRef}
          className="uppercase"
          style={{
            fontFamily: "var(--font-agatho)",
            fontSize: "clamp(32px, 5vw, 56px)",
            lineHeight: 1.1,
            color: INK,
          }}
        >
          Studio{" "}
          <span style={{ fontStyle: "italic" }}>
            <InlineWordmark text="SP_ACE" />
          </span>{" "}
          in Press
        </h1>
        {/* TODO: placeholder subtext -- pending final copy approval, same
            convention as every other unconfirmed-copy spot on this site
            (home/Press.jsx's own heading, ContactContent's hero). */}
        <p
          ref={subtextRef}
          className="mt-4 max-w-lg text-sm md:text-base"
          style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.65 }}
        >
          Everywhere Studio SP_ACE&rsquo;s work has been featured in
          architecture and design press.
        </p>
      </div>
    </section>
  );
}

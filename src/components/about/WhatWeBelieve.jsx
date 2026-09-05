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
const CARD_SURFACE = "#FBF6EE";
const INK = "#2B2622";
const MAROON = "#6E1F24";

const HEADING = "What We Believe";

// TODO: placeholder principles -- swap in the client's real 4 belief
// statements once provided. Structure/styling below is final.
const BELIEFS = [
  {
    title: "Honest Materials",
    body: "More on our approach to material selection is on its way.",
  },
  {
    title: "Considered Detail",
    body: "More on our attention to detail is on its way.",
  },
  {
    title: "Timeless Design",
    body: "More on our design philosophy is on its way.",
  },
  {
    title: "Client-Centered Process",
    body: "More on our collaborative process is on its way.",
  },
];

// Second rebuild: the split-screen scroll-progress track (previous version)
// was also rejected by the client -- they want a project-roadmap-style
// zigzag of step cards linked by dashed connector arrows instead. Adapted
// structure only; colors/fonts/copy stay this project's own (cream/ink/
// maroon, Agatho/Manrope, the real belief copy) rather than the reference's
// own palette and content shape (no date chips, no colored icon tiles).
//
// Each card is a plain one-shot ScrollTrigger reveal (same idiom as
// ProjectGallery.jsx's per-row stagger and ProjectsGrid.jsx's card-grid
// reveal: gsap.set hidden -> gsap.to on enter, power3.out, scrub: false,
// toggleActions "play none none none") -- there's no shared scroll-progress
// value driving multiple things here the way the previous version needed,
// so there's no golden-rule concern: every element is both the trigger and
// the sole target of its own independent one-shot tween.
//
// The zigzag alignment and the desktop-curved-vs-mobile-straight connector
// shape are both pure CSS/responsive-markup decisions (alternating
// justify-start/justify-end, and two connector SVGs toggled with
// hidden/md:hidden) -- no JS matchMedia/isDesktop hook, same preference the
// previous version of this file already noted: nothing here needs to *know*
// the breakpoint in JS, only the rendered layout needs to differ.

const ARROW_MARKER_ID = "wwb-connector-arrow";

function NumberBadge({ index }) {
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm md:h-12 md:w-12 md:text-base"
      style={{ backgroundColor: MAROON, color: CREAM, fontFamily: "var(--font-manrope)" }}
    >
      {String(index + 1).padStart(2, "0")}
    </div>
  );
}

function StepCard({ index, belief, cardRef, reduceMotion }) {
  return (
    <div
      ref={cardRef}
      className="w-full max-w-[480px] rounded-[28px] border p-7 md:p-8"
      style={{
        backgroundColor: CARD_SURFACE,
        borderColor: "rgba(43,38,34,0.1)",
        boxShadow: "0 4px 20px rgba(43,38,34,0.05)",
        ...(reduceMotion ? null : { opacity: 0 }),
      }}
    >
      <NumberBadge index={index} />
      <h3
        className="mt-5 text-xl md:text-2xl"
        style={{ fontFamily: "var(--font-agatho)", color: INK }}
      >
        {belief.title}
      </h3>
      <p
        className="mt-3 text-sm md:text-base"
        style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.65 }}
      >
        {belief.body}
      </p>
    </div>
  );
}

// One dashed connector between consecutive cards -- a curved diagonal on
// desktop (mirrored left<->right depending on which way the zigzag is
// turning), a plain straight vertical line on mobile where cards stack
// centered instead. Both live in the DOM at once; CSS (hidden/md:hidden)
// picks which one paints, so there's no JS breakpoint dependency.
function Connector({ direction, arrowRef, reduceMotion }) {
  const hiddenStyle = reduceMotion ? null : { opacity: 0 };
  const desktopPath = "M20,0 C20,55 80,45 80,100";

  return (
    <div ref={arrowRef} style={hiddenStyle}>
      <div className="hidden h-[90px] w-full md:block">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <g transform={direction === "rtl" ? "translate(100,0) scale(-1,1)" : undefined}>
            <path
              d={desktopPath}
              fill="none"
              stroke={INK}
              strokeOpacity="0.3"
              strokeWidth="1.5"
              strokeDasharray="5 5"
              vectorEffect="non-scaling-stroke"
              markerEnd={`url(#${ARROW_MARKER_ID})`}
            />
          </g>
        </svg>
      </div>
      <div className="h-[56px] w-full md:hidden">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <path
            d="M50,0 L50,100"
            fill="none"
            stroke={INK}
            strokeOpacity="0.3"
            strokeWidth="1.5"
            strokeDasharray="5 5"
            vectorEffect="non-scaling-stroke"
            markerEnd={`url(#${ARROW_MARKER_ID})`}
          />
        </svg>
      </div>
    </div>
  );
}

export default function WhatWeBelieve() {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);
  const arrowRefs = useRef([]);
  // `initial = true` (assume reduced until matchMedia resolves), same
  // reasoning as Quote.jsx's own heavier pinned sequence -- confirmed via
  // live testing (not just reasoning) that starting `false` causes a real
  // bug here: the gated effect briefly runs with stale reduceMotion=false
  // before the hook resolves, gsap.set()s cards to opacity 0, and when
  // reduceMotion then flips true, gsap.context's revert() restores its own
  // pre-recorded snapshot -- which was ALSO 0 (React's own initial inline
  // style) -- leaving cards permanently invisible under reduced motion
  // instead of clearing the override entirely. Starting `true` means the
  // gated effect never runs in that scenario at all.
  const reduceMotion = useReducedMotion(true);

  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        const cards = cardRefs.current.filter(Boolean);
        const arrows = arrowRefs.current.filter(Boolean);

        cards.forEach((card) => {
          gsap.set(card, { opacity: 0, y: 32 });
          gsap.to(card, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          });
        });

        arrows.forEach((arrow) => {
          gsap.set(arrow, { opacity: 0, y: 16 });
          gsap.to(arrow, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: {
              trigger: arrow,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          });
        });
      }, sectionRef);

      return () => ctx.revert();
    },
    [],
    !reduceMotion
  );

  return (
    <section
      ref={sectionRef}
      className="w-full overflow-hidden px-6 py-16 md:px-16 md:py-24"
      style={{ backgroundColor: CREAM }}
    >
      {/* Shared arrowhead marker, referenced by every connector below --
          defined once so it isn't duplicated per SVG. */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <marker
            id={ARROW_MARKER_ID}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 Z" fill={INK} fillOpacity="0.35" />
          </marker>
        </defs>
      </svg>

      <div className="mx-auto w-full max-w-[1100px]">
        <h2
          className="text-center text-[36px] md:text-[64px]"
          style={{ fontFamily: "var(--font-agatho)", color: INK }}
        >
          {HEADING}
        </h2>

        <div className="mt-14 flex flex-col md:mt-20">
          {BELIEFS.map((belief, i) => {
            const alignClass =
              i % 2 === 0
                ? "flex justify-center md:justify-start"
                : "flex justify-center md:justify-end";

            return (
              <div key={belief.title}>
                {i > 0 && (
                  <Connector
                    direction={(i - 1) % 2 === 0 ? "ltr" : "rtl"}
                    reduceMotion={reduceMotion}
                    arrowRef={(el) => (arrowRefs.current[i - 1] = el)}
                  />
                )}
                <div className={alignClass}>
                  <StepCard
                    index={i}
                    belief={belief}
                    reduceMotion={reduceMotion}
                    cardRef={(el) => (cardRefs.current[i] = el)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

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

// Third rebuild: client approved a specific reference structure (a project-
// roadmap-style layout with pill cards, a rotated-text tab plugged into
// each card's left edge, an icon+title row, and dashed curved connectors in
// a descending staircase arrangement) and asked for it reproduced
// precisely, not loosely approximated. Adapted, not copied verbatim: the
// reference's colored icon chips/date-range chips/"Project Details" badge
// don't apply here (no project-timeline data), so those are dropped
// entirely rather than filled with invented placeholder data -- the tab,
// icon+title row, and card anatomy are what actually translate, restyled
// in this project's own cream/ink/maroon + Agatho/Manrope.
//
// Desktop staircase positions are absolute (%x/%y within one relative
// container) because the reference's staggered rhythm -- each card offset
// both horizontally AND vertically from the last -- can't be produced by
// normal document flow the way the previous (looser) zigzag rebuild was.
// Mobile drops the whole absolute-position system for a plain centered
// flow stack (see the responsive note below).
//
// Reveal is still the same low-risk per-element one-shot ScrollTrigger
// idiom as ProjectGallery.jsx/ProjectsGrid.jsx (gsap.set hidden -> gsap.to
// on enter, power3.out, toggleActions "play none none none") -- explicitly
// NOT a shared scroll-progress value driving multiple things (that was the
// first rebuild, also rejected), and explicitly NOT an animated line-draw
// on the connectors (this section has a documented history of animation
// bugs; the connectors are static paths that just fade in with their card).

const ARROW_MARKER_ID = "wwb-connector-arrow";

// left/top are % positions of each card's own top-left corner within the
// desktop staircase container -- a close start on the reference's
// proportions, tuned by rendering and eyeballing (see comment on the
// container below), not treated as exact.
const STAIRCASE = [
  { left: 5, top: 0 },
  { left: 45, top: 25 },
  { left: 5, top: 50 },
  { left: 45, top: 75 },
];

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20c0-9 5-15 15-16-1 10-6 15-15 16Z" />
      <path d="M6 18c3-4 7-8 12-13" />
    </svg>
  );
}

function RulerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="9" width="18" height="6" rx="1" />
      <path d="M7 9v3M11 9v3M15 9v3" />
    </svg>
  );
}

function HourglassIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h12c0 5-4 6-6 8-2-2-6-3-6-8Z" />
      <path d="M6 20h12c0-5-4-6-6-8-2 2-6 3-6 8Z" />
    </svg>
  );
}

function PartnershipIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="12" r="6" />
      <circle cx="15" cy="12" r="6" />
    </svg>
  );
}

const ICONS = [LeafIcon, RulerIcon, HourglassIcon, PartnershipIcon];

// The reference's rotated-text tab, "plugged into" the card's left edge --
// half outside (the negative left offset), half overlapping into the
// card's own padding. No project-timeline data to show here, so this
// carries the step number instead of a duration ("1 Week" etc. in the
// reference) -- same visual device, content that actually fits.
function TabCapsule({ index }) {
  return (
    <div
      className="absolute -left-5 top-7 flex h-24 w-10 items-center justify-center rounded-full md:-left-6 md:top-8 md:h-28 md:w-11"
      style={{ backgroundColor: MAROON }}
    >
      <span
        className="whitespace-nowrap text-xs tracking-[0.15em] md:text-sm"
        style={{ fontFamily: "var(--font-manrope)", color: CREAM, transform: "rotate(-90deg)" }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
    </div>
  );
}

function IconChip({ Icon }) {
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: "rgba(43,38,34,0.06)" }}
    >
      <Icon />
    </div>
  );
}

function StepCard({ index, belief, cardRef, reduceMotion, className = "" }) {
  const Icon = ICONS[index];
  return (
    <div
      ref={cardRef}
      className={`relative rounded-[30px] border py-7 pl-10 pr-7 md:py-8 md:pl-12 md:pr-8 ${className}`}
      style={{
        backgroundColor: CARD_SURFACE,
        borderColor: "rgba(43,38,34,0.1)",
        boxShadow: "0 4px 20px rgba(43,38,34,0.05)",
        ...(reduceMotion ? null : { opacity: 0 }),
      }}
    >
      <TabCapsule index={index} />
      <div className="flex items-center gap-3">
        <IconChip Icon={Icon} />
        <h3
          className="text-xl md:text-2xl"
          style={{ fontFamily: "var(--font-agatho)", color: INK }}
        >
          {belief.title}
        </h3>
      </div>
      <p
        className="mt-4 text-sm md:text-base"
        style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.65 }}
      >
        {belief.body}
      </p>
    </div>
  );
}

// Desktop-only curved dashed connector, absolutely boxed into the gap
// between two consecutive staircase cards. `mirror` flips the curve
// horizontally for the legs that run right-to-left instead of left-to-
// right, reusing one path rather than authoring two.
function StaircaseConnector({ box, mirror, arrowRef, reduceMotion }) {
  return (
    <div
      ref={arrowRef}
      className="absolute hidden md:block"
      style={{ ...box, ...(reduceMotion ? null : { opacity: 0 }) }}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
        <g transform={mirror ? "translate(100,0) scale(-1,1)" : undefined}>
          <path
            d="M0,0 C45,15 55,60 100,100"
            fill="none"
            stroke={INK}
            strokeOpacity="0.35"
            strokeWidth="1.5"
            strokeDasharray="5 5"
            vectorEffect="non-scaling-stroke"
            markerEnd={`url(#${ARROW_MARKER_ID})`}
          />
        </g>
      </svg>
    </div>
  );
}

// Mobile-only straight vertical connector between stacked cards -- the
// staircase's diagonal geometry doesn't translate to a single narrow
// column, so this drops to the simplest possible link instead of forcing
// the curve.
function MobileConnector({ arrowRef, reduceMotion }) {
  return (
    <div
      ref={arrowRef}
      className="h-14 w-full md:hidden"
      style={reduceMotion ? null : { opacity: 0 }}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
        <path
          d="M50,0 L50,100"
          fill="none"
          stroke={INK}
          strokeOpacity="0.35"
          strokeWidth="1.5"
          strokeDasharray="5 5"
          vectorEffect="non-scaling-stroke"
          markerEnd={`url(#${ARROW_MARKER_ID})`}
        />
      </svg>
    </div>
  );
}

export default function WhatWeBelieve() {
  const sectionRef = useRef(null);
  const desktopCardRefs = useRef([]);
  const desktopArrowRefs = useRef([]);
  const mobileCardRefs = useRef([]);
  const mobileArrowRefs = useRef([]);
  // `initial = true` -- confirmed via live testing (not just reasoning)
  // that starting `false` causes a real bug: the gated effect briefly runs
  // with stale reduceMotion=false before the hook resolves, gsap.set()s
  // cards to opacity 0, and when reduceMotion then flips true,
  // gsap.context's revert() restores its own pre-recorded snapshot --
  // which was ALSO 0 -- leaving cards permanently invisible under reduced
  // motion instead of clearing the override. Starting `true` means the
  // gated effect never runs in that scenario at all.
  const reduceMotion = useReducedMotion(true);

  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        const cards = [...desktopCardRefs.current, ...mobileCardRefs.current].filter(Boolean);
        const arrows = [...desktopArrowRefs.current, ...mobileArrowRefs.current].filter(Boolean);

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

        {/* Desktop staircase -- one relative container tall enough to hold
            all 4 cards at their staggered top offsets (see STAIRCASE)
            without the last one overflowing the bottom. Height is a fixed
            px value tuned by rendering, not derived, since the cards'
            own content height (title/body line-wrapping) isn't something
            CSS percentage math can account for automatically. */}
        <div className="relative mt-16 hidden md:block" style={{ height: "1100px" }}>
          {BELIEFS.map((belief, i) => (
            <div
              key={belief.title}
              className="absolute"
              style={{ left: `${STAIRCASE[i].left}%`, top: `${STAIRCASE[i].top}%`, width: "380px" }}
            >
              <StepCard
                index={i}
                belief={belief}
                reduceMotion={reduceMotion}
                cardRef={(el) => (desktopCardRefs.current[i] = el)}
              />
            </div>
          ))}

          {/* Boxes below are sized to sit strictly in the gap BETWEEN each
              pair of cards (never overlapping either card's own box) --
              measured against actual rendered card positions (each card is
              ~15% of the container's height at STAIRCASE's top offsets),
              not the container's raw top/gap percentages. A first pass
              used the raw gap between STAIRCASE entries directly and the
              curve visibly cut through both cards' body text -- confirmed
              via screenshot, not just math -- because a card's real height
              eats well into the *next* card's nominal top offset. */}
          <StaircaseConnector
            box={{ left: "28%", top: "15.5%", width: "22%", height: "9%" }}
            mirror={false}
            reduceMotion={reduceMotion}
            arrowRef={(el) => (desktopArrowRefs.current[0] = el)}
          />
          <StaircaseConnector
            box={{ left: "32%", top: "40.5%", width: "20%", height: "9%" }}
            mirror={true}
            reduceMotion={reduceMotion}
            arrowRef={(el) => (desktopArrowRefs.current[1] = el)}
          />
          <StaircaseConnector
            box={{ left: "28%", top: "65.5%", width: "22%", height: "9%" }}
            mirror={false}
            reduceMotion={reduceMotion}
            arrowRef={(el) => (desktopArrowRefs.current[2] = el)}
          />
        </div>

        {/* Mobile: the staircase's diagonal offsets don't translate to a
            narrow viewport -- plain centered column instead, straight
            vertical connectors between stacked cards. */}
        <div className="mt-14 flex flex-col items-center md:hidden">
          {BELIEFS.map((belief, i) => (
            <div key={belief.title} className="w-full max-w-[420px]">
              {i > 0 && (
                <MobileConnector
                  reduceMotion={reduceMotion}
                  arrowRef={(el) => (mobileArrowRefs.current[i - 1] = el)}
                />
              )}
              <StepCard
                index={i}
                belief={belief}
                reduceMotion={reduceMotion}
                className="w-full"
                cardRef={(el) => (mobileCardRefs.current[i] = el)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

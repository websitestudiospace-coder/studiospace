"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { PenTool, Ruler, Palette, Lightbulb, Home as HomeIcon, Leaf } from "lucide-react";

const CREAM = "#F7EFE4";
const INK = "#2B2622";
const MAROON = "#6E1F24";

// Echoes the founders' own words in MeetFounders.jsx ("creating spaces that
// feel personal, thoughtful, and true to the people and purpose behind
// them") rather than inventing new brand copy from scratch.
const HEADLINE = "spaces that feel personal";
const CAPTION = "shaped by light, material & detail";

// Generic process icons standing in for the original demo's tech-stack
// logos -- tied to the same six ideas WhatWeBelieve.jsx already names
// (detail, material, light, space, the unexpected, restraint).
const PROCESS_ICONS = [PenTool, Ruler, Palette, Lightbulb, HomeIcon, Leaf];

function CharacterV1({ char, index, centerIndex, scrollYProgress }) {
  const isSpace = char === " ";
  const distanceFromCenter = index - centerIndex;

  const x = useTransform(scrollYProgress, [0, 0.5], [distanceFromCenter * 50, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [distanceFromCenter * 50, 0]);

  return (
    <motion.span
      className={`inline-block${isSpace ? " w-4" : ""}`}
      style={{ x, rotateX, color: MAROON }}
    >
      {char}
    </motion.span>
  );
}

function IconV2({ Icon, index, centerIndex, scrollYProgress }) {
  const distanceFromCenter = index - centerIndex;

  const x = useTransform(scrollYProgress, [0, 0.5], [distanceFromCenter * 50, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.75, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [Math.abs(distanceFromCenter) * 50, 0]);

  return (
    <motion.div
      className="flex h-16 w-16 shrink-0 items-center justify-center will-change-transform"
      style={{ x, scale, y, transformOrigin: "center" }}
    >
      <Icon className="h-9 w-9" style={{ color: MAROON }} strokeWidth={1.5} />
    </motion.div>
  );
}

function IconV3({ Icon, index, centerIndex, scrollYProgress }) {
  const distanceFromCenter = index - centerIndex;

  const x = useTransform(scrollYProgress, [0, 0.5], [distanceFromCenter * 90, 0]);
  const rotate = useTransform(scrollYProgress, [0, 0.5], [distanceFromCenter * 50, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [-Math.abs(distanceFromCenter) * 20, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.75, 1]);

  return (
    <motion.div
      className="flex h-16 w-16 shrink-0 items-center justify-center will-change-transform"
      style={{ x, rotate, y, scale, transformOrigin: "center" }}
    >
      <Icon className="h-9 w-9" style={{ color: MAROON }} strokeWidth={1.5} />
    </motion.div>
  );
}

function Bracket({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 27 78" className={className}>
      <path
        fill={MAROON}
        d="M26.52 77.21h-5.75c-6.83 0-12.38-5.56-12.38-12.38V48.38C8.39 43.76 4.63 40 .01 40v-4c4.62 0 8.38-3.76 8.38-8.38V12.4C8.38 5.56 13.94 0 20.77 0h5.75v4h-5.75c-4.62 0-8.38 3.76-8.38 8.38V27.6c0 4.34-2.25 8.17-5.64 10.38 3.39 2.21 5.64 6.04 5.64 10.38v16.45c0 4.62 3.76 8.38 8.38 8.38h5.75v4.02Z"
      />
    </svg>
  );
}

// Adapted from a framer-motion + lenis scroll-text demo. This site already
// runs a single shared Lenis instance for the whole page (created once in
// SmoothScroll.jsx and never re-created -- see that file's own comment on
// why a second instance would fight it for control of window scroll), so
// unlike the original demo this component does NOT wrap itself in its own
// <ReactLenis root>. framer-motion's useScroll reads real scroll position,
// which the shared Lenis instance already keeps in sync, so no wrapper is
// needed here for the scroll-linked transforms below to work.
export default function TextScrollAnimation() {
  const targetRef = useRef(null);
  const targetRef2 = useRef(null);
  const targetRef3 = useRef(null);

  const { scrollYProgress } = useScroll({ target: targetRef });
  const { scrollYProgress: scrollYProgress2 } = useScroll({ target: targetRef2 });
  const { scrollYProgress: scrollYProgress3 } = useScroll({ target: targetRef3 });

  const characters = HEADLINE.split("");
  const centerIndex = Math.floor(characters.length / 2);
  const iconCenterIndex = Math.floor(PROCESS_ICONS.length / 2);

  return (
    <section className="relative w-full" style={{ backgroundColor: CREAM }}>
      <div className="top-22 absolute left-1/2 z-10 grid -translate-x-1/2 content-start justify-items-center gap-6 text-center">
        <span
          className="relative max-w-[12ch] text-xs uppercase leading-tight opacity-40 after:absolute after:left-1/2 after:top-full after:h-16 after:w-px after:bg-gradient-to-b after:from-[#F7EFE4] after:to-[#2B2622] after:content-['']"
          style={{ fontFamily: "var(--font-manrope)", color: INK }}
        >
          Scroll to see more
        </span>
      </div>

      <div
        ref={targetRef}
        className="relative box-border flex h-[210vh] items-center justify-center gap-[2vw] overflow-hidden p-[2vw]"
        style={{ backgroundColor: CREAM }}
      >
        <div
          className="w-full max-w-4xl text-center text-6xl font-bold uppercase tracking-tighter"
          style={{ perspective: "500px", fontFamily: "var(--font-agatho)" }}
        >
          {characters.map((char, index) => (
            <CharacterV1
              key={index}
              char={char}
              index={index}
              centerIndex={centerIndex}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>
      </div>

      <div
        ref={targetRef2}
        className="relative -mt-[100vh] box-border flex h-[210vh] flex-col items-center justify-center gap-[2vw] overflow-hidden p-[2vw]"
        style={{ backgroundColor: CREAM }}
      >
        <p
          className="flex items-center justify-center gap-3 text-2xl font-medium tracking-tight"
          style={{ fontFamily: "var(--font-manrope)", color: INK }}
        >
          <Bracket className="h-12" />
          <span>{CAPTION}</span>
          <Bracket className="h-12 scale-x-[-1]" />
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8">
          {PROCESS_ICONS.map((Icon, index) => (
            <IconV2
              key={index}
              Icon={Icon}
              index={index}
              centerIndex={iconCenterIndex}
              scrollYProgress={scrollYProgress2}
            />
          ))}
        </div>
      </div>

      <div
        ref={targetRef3}
        className="relative -mt-[95vh] box-border flex h-[210vh] flex-col items-center justify-center gap-[2vw] overflow-hidden p-[2vw]"
        style={{ backgroundColor: CREAM }}
      >
        <p
          className="flex items-center justify-center gap-3 text-2xl font-medium tracking-tight"
          style={{ fontFamily: "var(--font-manrope)", color: INK }}
        >
          <Bracket className="h-12" />
          <span>{CAPTION}</span>
          <Bracket className="h-12 scale-x-[-1]" />
        </p>

        <div
          className="flex flex-wrap items-center justify-center gap-8"
          style={{ perspective: "500px" }}
        >
          {PROCESS_ICONS.map((Icon, index) => (
            <IconV3
              key={index}
              Icon={Icon}
              index={index}
              centerIndex={iconCenterIndex}
              scrollYProgress={scrollYProgress3}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

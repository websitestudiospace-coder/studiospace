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
const MAROON = "#6E1F24";

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

function BeliefItem({ index, belief, itemRef }) {
  return (
    <div
      ref={itemRef}
      className="border-t py-8 first:border-t-0 md:border-t-0 md:py-0"
      style={{ borderColor: "rgba(43,38,34,0.12)" }}
    >
      <span
        className="text-sm md:text-base"
        style={{ fontFamily: "var(--font-manrope)", color: MAROON, opacity: 0.8 }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <h3
        className="mt-3 text-xl md:text-2xl"
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

export default function WhatWeBelieve() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const itemRefs = useRef([]);
  const reduceMotion = useReducedMotion();

  // One-shot reveal (not scroll-scrubbed) -- same Phase 3 pattern as
  // Press/Footer: heading first, then the 4 belief items staggered in
  // behind it, all on one timeline against one trigger.
  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        const items = itemRefs.current.filter(Boolean);
        gsap.set(headingRef.current, { opacity: 0, y: 24 });
        gsap.set(items, { opacity: 0, y: 24 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });

        tl.to(headingRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0);
        tl.to(
          items,
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.12 },
          0.15
        );
      }, sectionRef);

      return () => ctx.revert();
    },
    [],
    !reduceMotion
  );

  return (
    <section
      ref={sectionRef}
      className="w-full px-6 py-16 md:px-16 md:py-24"
      style={{ backgroundColor: CREAM }}
    >
      <div className="mx-auto w-full max-w-[1100px]">
        <h2
          ref={headingRef}
          className="text-center text-[32px] md:text-[48px]"
          style={{ fontFamily: "var(--font-agatho)", color: INK }}
        >
          What We Believe
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-x-12 md:mt-16 md:grid-cols-2 md:gap-y-12">
          {BELIEFS.map((belief, i) => (
            <BeliefItem
              key={belief.title}
              index={i}
              belief={belief}
              itemRef={(el) => (itemRefs.current[i] = el)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

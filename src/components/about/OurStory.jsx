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

// One-shot fade+y reveal, same Phase pattern MeetFounders' content timeline
// and Press's heading/carousel reveal already use on this page -- a single
// ScrollTrigger, "top 80%", toggleActions "play none none none", power3.out.
// No new visual pattern introduced for this section.
export default function OurStory() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const reduceMotion = useReducedMotion();

  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        gsap.set(contentRef.current, { opacity: 0, y: 24 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });

        tl.to(contentRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0);
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
      <div
        ref={contentRef}
        className="mx-auto max-w-[820px] text-center"
        style={reduceMotion ? undefined : { opacity: 0 }}
      >
        <h2
          className="text-[32px] md:text-[48px]"
          style={{ fontFamily: "var(--font-agatho)", color: INK }}
        >
          Our Story
        </h2>
        <p
          className="mt-6 text-sm md:text-base"
          style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.7 }}
        >
          The name SP_ACE started with the two of us — Shubham and Priyanka —
          and a little play on words. SP for us, and ACE for what we set out
          to do: ace what we love doing. What started in Bangalore in 2022
          has grown into a studio working across cities, with every project
          bringing a new story, a new perspective, and a new way of looking
          at design.
        </p>
      </div>
    </section>
  );
}

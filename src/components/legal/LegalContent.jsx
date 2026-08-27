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

const HEADING_CLASS = "text-[32px] md:text-[48px]";

export function LegalSection({ heading, children }) {
  return (
    <section className="mt-10 first:mt-0 md:mt-12">
      <h2
        className="text-lg md:text-xl"
        style={{ fontFamily: "var(--font-agatho)", color: CREAM }}
      >
        {heading}
      </h2>
      <div
        className="mt-3 flex flex-col gap-3 text-sm leading-relaxed md:text-base"
        style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.7 }}
      >
        {children}
      </div>
    </section>
  );
}

export default function LegalContent({ title, updated, children }) {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const bodyRef = useRef(null);
  const reduceMotion = useReducedMotion();

  // One-shot reveal (not scroll-scrubbed), same Phase 3 pattern as
  // ContactContent/Footer: heading block first, then the legal body.
  // Still waits for "preloader:complete" since "top 80%" is calculated
  // against this section's own position, which depends on Nav/Preloader
  // having already settled.
  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        gsap.set(headingRef.current, { opacity: 0, y: 24 });
        gsap.set(bodyRef.current, { opacity: 0, y: 24 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });

        tl.to(headingRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0);
        tl.to(bodyRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.15);
      }, sectionRef);

      return () => ctx.revert();
    },
    [],
    !reduceMotion
  );

  return (
    <section
      ref={sectionRef}
      className="w-full px-6 pt-32 pb-20 md:px-16 md:pt-44 md:pb-32"
      style={{ backgroundColor: INK }}
    >
      <div className="mx-auto w-full max-w-[900px]">
        {/* This is placeholder legal content pending review by a qualified
            lawyer before launch -- swap in lawyer-reviewed copy before
            going live. Intentionally not shown to visitors. */}
        <div ref={headingRef}>
          <h1
            className={`${HEADING_CLASS} mt-10`}
            style={{ fontFamily: "var(--font-agatho)", color: CREAM, lineHeight: 1.1 }}
          >
            {title}
          </h1>
          <p
            className="mt-3 text-xs uppercase tracking-[0.15em] md:text-sm"
            style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.65 }}
          >
            Last updated: {updated}
          </p>
        </div>

        <div ref={bodyRef} className="mt-4">
          {children}
        </div>
      </div>
    </section>
  );
}

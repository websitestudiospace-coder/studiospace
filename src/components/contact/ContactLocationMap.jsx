"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import IndiaMapEmbed from "@/components/shared/IndiaMapEmbed";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";

// Map-only usage of the shared India/Bangalore embed (see
// src/components/shared/IndiaMapEmbed.jsx and src/components/about/
// IndiaMap.jsx for the zoom/framing tuning history) -- no heading/caption/
// CTA here, since the About page's "Where We Work" framing doesn't fit
// naturally right after the contact form. Still gets this site's standard
// one-shot fade-in-on-scroll treatment for consistency with every other
// section on this page.
export default function ContactLocationMap() {
  const sectionRef = useRef(null);
  const mapWrapRef = useRef(null);
  const reduceMotion = useReducedMotion(true);

  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        gsap.set(mapWrapRef.current, { opacity: 0, y: 24 });
        gsap.to(mapWrapRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      }, sectionRef);

      return () => ctx.revert();
    },
    [],
    !reduceMotion
  );

  return (
    <section ref={sectionRef} className="w-full py-16 md:py-24" style={{ backgroundColor: CREAM }}>
      <div ref={mapWrapRef} className="w-full">
        <IndiaMapEmbed />
      </div>
    </section>
  );
}

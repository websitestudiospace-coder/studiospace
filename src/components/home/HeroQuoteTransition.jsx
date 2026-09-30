"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hero from "./Hero";
import useReducedMotion from "@/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Extra height on the sticky wrapper for the hero hold: 100svh + 60svh.
const PIN_EXTRA_VH = 60;

export default function HeroQuoteTransition() {
  const heroPinRef = useRef(null);
  const heroInnerRef = useRef(null);
  const reduceMotion = useReducedMotion();
  // Runs at every width; only reduced motion opts out. svh (not vh) to match
  // Hero's h-[100svh] -- on mobile Safari vh ignores the visible toolbar.
  const parallax = !reduceMotion;

  useEffect(() => {
    if (!parallax) return;

    const ctx = gsap.context(() => {
      // Only heroPinRef is pinned/transformed here, and nothing inside it has
      // its own ScrollTrigger. Quote renders as an untransformed sibling (see
      // page.js): when it was nested in this transformed wrapper, its trigger
      // cached positions against a transform that later changed, causing a
      // visible "bounce back" at the Hero -> Quote handoff.
      //
      // Sticky + scrub, never ScrollTrigger's pin: true. pin: true inserts a
      // pin-spacer div outside React's tree, and unmounting this branch (e.g.
      // reduced motion toggling at runtime) then throws "removeChild: the
      // node to be removed is not a child of this node".
      gsap.set(heroInnerRef.current, { scale: 1.15 });
      gsap.to(heroInnerRef.current, {
        yPercent: -8,
        opacity: 0.7,
        ease: "none",
        scrollTrigger: {
          trigger: heroPinRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });
    }, heroPinRef);

    return () => ctx.revert();
  }, [parallax]);

  if (!parallax) {
    return <Hero />;
  }

  return (
    <div
      ref={heroPinRef}
      className="relative z-0 w-full"
      style={{ height: `${100 + PIN_EXTRA_VH}svh` }}
    >
      <div
        className="sticky top-0 h-[100svh] w-full overflow-hidden"
        // Dark backdrop: heroInnerRef fades to 0.7 opacity during the pin,
        // and without this the cream page background showed through as a
        // haze over the video.
        style={{ backgroundColor: "#2B2622" }}
      >
        <div ref={heroInnerRef} className="h-full w-full">
          <Hero />
        </div>
      </div>
    </div>
  );
}

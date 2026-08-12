"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hero from "./Hero";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PIN_DISTANCE = "+=60%";

export default function HeroQuoteTransition() {
  const heroPinRef = useRef(null);
  const heroInnerRef = useRef(null);
  const [parallax, setParallax] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)"
    );
    const update = () => setParallax(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!parallax) return;

    const ctx = gsap.context(() => {
      // heroPinRef is the ONLY pinned/transformed element this component
      // owns, and heroInnerRef (its transformed content) has no descendant
      // with its own separate ScrollTrigger. Quote, which used to sit
      // directly below it, renders as a plain, untransformed sibling at the
      // page.js level instead of being nested in here, so its own
      // ScrollTrigger always measures against a stable ancestor.
      //
      // This is the fix for a bug that used to live here: Quote was once
      // wrapped in a div animated by this same pin's scrub. Because that
      // wrapper's transform sat between Quote's own trigger element and the
      // document root, ScrollTrigger cached Quote's start/end against
      // whatever the wrapper's transform happened to be at refresh time
      // (page load, pre-scroll), and that cached value went stale the
      // moment the wrapper's transform settled to a different value during
      // real scrolling -- the visible "bounce back" on the Hero handoff.
      // Keeping the pin's transform confined to content with no
      // independently-triggered descendants removes that failure mode
      // entirely. See page.js for the other half of this.
      gsap.set(heroInnerRef.current, { scale: 1.15 });
      gsap.to(heroInnerRef.current, {
        yPercent: -8,
        opacity: 0.7,
        ease: "none",
        scrollTrigger: {
          trigger: heroPinRef.current,
          start: "top top",
          end: PIN_DISTANCE,
          scrub: true,
          pin: true,
          pinSpacing: true,
        },
      });
    }, heroPinRef);

    return () => ctx.revert();
  }, [parallax]);

  if (!parallax) {
    return <Hero />;
  }

  return (
    <div ref={heroPinRef} className="relative z-0 h-screen w-full overflow-hidden">
      <div ref={heroInnerRef} className="h-full w-full">
        <Hero />
      </div>
    </div>
  );
}

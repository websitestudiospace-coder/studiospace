"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hero from "./Hero";
import useReducedMotion from "@/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Matches the old GSAP `pin:true` distance ("+=60%" of the trigger's own
// 100vh) as extra height on the sticky wrapper below -- 100vh natural +
// 60vh reserved = 160vh total, so nothing after this component shifts.
const PIN_EXTRA_VH = 60;

export default function HeroQuoteTransition() {
  const heroPinRef = useRef(null);
  const heroInnerRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Equivalent to the single compound query this used to run
  // ("(min-width: 768px) and (prefers-reduced-motion: no-preference)") --
  // split into the two matchMedia checks every other pinned section already
  // keeps separate, combined here the same way they combine `enhanced`.
  const parallax = isDesktop && !reduceMotion;

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
      //
      // Deliberately NOT using ScrollTrigger's `pin:true` here (even though
      // it's a one-line way to get the same visual hold): pin:true inserts
      // a "pin-spacer" wrapper div into the live DOM outside React's fiber
      // tree. That's invisible to React until something elsewhere on the
      // page forces this component to unmount its enhanced branch (e.g.
      // prefers-reduced-motion flipping at runtime) -- React then tries to
      // remove heroPinRef from the parent IT rendered it under, but GSAP has
      // rewired the DOM so the real parent is the pin-spacer, producing
      // "Failed to execute 'removeChild': the node to be removed is not a
      // child of this node." The sticky+scrub pattern below never mutates
      // DOM structure (only inline styles), matching every other pinned
      // section on this page (About/Projects/Instagram/Press/Footer), so
      // this class of conflict can't happen here either.
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
      style={{ height: `${100 + PIN_EXTRA_VH}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div ref={heroInnerRef} className="h-full w-full">
          <Hero />
        </div>
      </div>
    </div>
  );
}

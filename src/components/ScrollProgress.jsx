"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import usePreloaderGate from "@/hooks/usePreloaderGate";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const MAROON = "#6E1F24";

// Client reference used framer-motion for this; this codebase's locked
// animation stack is GSAP + ScrollTrigger + Lenis (no framer-motion
// dependency), so this is a native rebuild of the same effect rather than
// installing a second animation library for one bar.
//
// z-[110], not the reference's z-50 -- Nav.jsx's fixed header is z-[100]
// and covers the same top strip. At z-50 the bar would render BEHIND Nav,
// meaning it'd only be visible while Nav is in its transparent/unscrolled
// state and disappear the moment Nav goes solid (which is most of the time
// a user is actually scrolling) -- that defeats the point of a persistent
// progress indicator, so this sits above Nav instead, as a thin maroon
// line always visible at the very top edge of the viewport.
export default function ScrollProgress() {
  const barRef = useRef(null);
  const pathname = usePathname();

  // Not gated by useReducedMotion -- this is a linear position indicator,
  // not a motion effect, so it stays active regardless of that setting.
  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        gsap.set(barRef.current, { scaleX: 0, transformOrigin: "left center" });
        // `start: 0, end: "max"` (GSAP's own idiom for "the whole
        // document's scrollable range"), not `trigger:
        // document.documentElement` -- confirmed via live testing that the
        // trigger-element form doesn't work here: getBoundingClientRect()
        // on the root element reports the viewport's height, not the true
        // document height, so start/end collapse to a near-zero range and
        // the bar never fills. `end: "max"` sidesteps that by asking
        // ScrollTrigger for the actual maximum scroll position directly.
        gsap.to(barRef.current, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            start: 0,
            end: "max",
            scrub: true,
          },
        });
      });

      return () => ctx.revert();
    },
    [],
    true
  );

  // This component lives in the root layout alongside Preloader/
  // SmoothScroll, both of which persist across client-side navigations
  // rather than remounting (App Router only swaps the route's own page
  // content) -- so the effect above runs exactly once for the whole
  // session, and the ScrollTrigger it creates caches its "end" position as
  // a pixel value measured against whichever page was on screen at that
  // moment. Navigating to a route with a different total page height (e.g.
  // "/" -> "/projects/[slug]") doesn't recompute that on its own.
  // SmoothScroll.jsx's own ScrollTrigger.refresh() calls only run on ITS
  // initial mount too (empty dependency array) -- nothing in this codebase
  // currently refreshes ScrollTrigger on route change, so this is the
  // first component that needs it.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [pathname]);

  return (
    <div className="fixed inset-x-0 top-0 z-[110] h-[3px] pointer-events-none" aria-hidden="true">
      <div ref={barRef} className="h-full w-full" style={{ backgroundColor: MAROON }} />
    </div>
  );
}

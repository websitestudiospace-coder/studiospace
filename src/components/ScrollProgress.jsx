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

// Thin maroon scroll-progress bar at the top of the viewport (GSAP, not
// framer-motion -- the site uses one animation stack). z-[110] keeps it
// above the fixed Nav (z-[100]).
export default function ScrollProgress() {
  const barRef = useRef(null);
  const pathname = usePathname();

  // Not gated by useReducedMotion -- this is a linear position indicator,
  // not a motion effect, so it stays active regardless of that setting.
  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        gsap.set(barRef.current, { scaleX: 0, transformOrigin: "left center" });
        // start 0 / end "max" covers the whole document; using
        // document.documentElement as the trigger measures only the
        // viewport height.
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

  // This component persists across client-side navigations, so its trigger's
  // cached end position must be refreshed when the route (and page height)
  // changes.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [pathname]);

  return (
    <div className="fixed inset-x-0 top-0 z-[110] h-[3px] pointer-events-none" aria-hidden="true">
      <div ref={barRef} className="h-full w-full" style={{ backgroundColor: MAROON }} />
    </div>
  );
}

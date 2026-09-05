"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setLenis } from "@/lib/lenis";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScroll({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    // The one and only Lenis instance for the whole page -- registered here
    // so other components (e.g. WhatWeBelieve's scroll-stack) can subscribe
    // to its scroll events via src/lib/lenis.js instead of ever creating
    // their own instance.
    setLenis(lenis);

    lenis.on("scroll", ScrollTrigger.update);

    const syncLenis = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(syncLenis);
    gsap.ticker.lagSmoothing(0);

    // Runs after every descendant's own mount effects (children commit
    // before parents), so every ScrollTrigger below has already been
    // created by this point. The custom "agatho" font can still swap in
    // after that initial measurement and shift text metrics/heights, so
    // refresh again once it's actually loaded.
    ScrollTrigger.refresh();
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      gsap.ticker.remove(syncLenis);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return children;
}

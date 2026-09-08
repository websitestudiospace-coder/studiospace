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

    // Lenis's own `autoResize` (on by default) watches `document.
    // documentElement` via ResizeObserver to recompute its scroll `limit`
    // when content height changes -- but ResizeObserver reports the ROOT
    // element's own generated box, which browsers pin to the viewport
    // regardless of how much its content overflows (a root-element-specific
    // quirk, not something this project's CSS causes -- confirmed live:
    // Lenis's limit never budged even minutes after content grew well past
    // it). `document.body` doesn't have that special root treatment: as a
    // normal block element with no explicit height in globals.css, its own
    // rendered box genuinely does grow to match its content, so observing
    // IT instead reliably fires on any real height change.
    //
    // This matters most across a client-side route change: this component
    // lives in the root layout and never unmounts on navigation (the App
    // Router only swaps the route's own page content), so the same Lenis
    // instance persists across routes, carrying whatever `limit` it last
    // measured. A one-shot `usePathname()`-triggered resize (the approach
    // ScrollProgress.jsx already uses for its own, separate ScrollTrigger
    // cache) isn't reliable here on its own -- confirmed live, it still
    // measured a too-short height, because the new route's full content
    // hadn't finished streaming in yet at the moment the pathname changed.
    // A persistent observer sidesteps that race entirely: it doesn't matter
    // when body's real height finishes settling, only that something is
    // listening for whenever it does. Left unfixed, navigating from a
    // shorter page (e.g. "/") to a taller one (e.g. "/about") clamped real
    // wheel-scroll input at exactly the shorter page's own scrollHeight
    // minus the viewport height, permanently blocking WhatWeBelieve's last
    // couple of cards from ever becoming reachable.
    const bodyResizeObserver = new ResizeObserver(() => lenis.resize());
    bodyResizeObserver.observe(document.body);

    return () => {
      bodyResizeObserver.disconnect();
      gsap.ticker.remove(syncLenis);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return children;
}

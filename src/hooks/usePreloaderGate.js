"use client";

import { useEffect } from "react";

// Runs `setup` once the "preloader:complete" event has fired (or
// immediately if it already fired before this effect ran, via
// window.__preloaderDone) -- every scroll-triggered GSAP entrance in the
// app needs this because ScrollTrigger start positions are measured
// against layout that only settles once the preloader intro has finished.
// `setup` may return a cleanup function (e.g. `() => ctx.revert()`), same
// as a normal effect. Pass `enabled = false` to skip entirely (e.g. when
// prefers-reduced-motion means there's nothing to gate).
export default function usePreloaderGate(setup, deps = [], enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    let cleanup;
    const run = () => {
      cleanup = setup();
    };

    if (window.__preloaderDone) {
      run();
    } else {
      window.addEventListener("preloader:complete", run, { once: true });
    }

    return () => {
      cleanup?.();
      window.removeEventListener("preloader:complete", run);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);
}

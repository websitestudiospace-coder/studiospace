"use client";

import { useEffect } from "react";

// Runs `setup` once the preloader intro has finished ("preloader:complete",
// or immediately if window.__preloaderDone is already set). ScrollTrigger
// positions must be measured against the settled layout. `setup` may return
// a cleanup. Pass `enabled = false` to skip (e.g. under reduced motion).
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

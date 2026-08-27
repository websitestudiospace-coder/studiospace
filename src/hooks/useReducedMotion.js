"use client";

import { useEffect, useState } from "react";

// Tracks prefers-reduced-motion live (not just at mount) so components can
// bail out of GSAP entrances the instant the OS setting changes mid-session.
// `initial` is the value used before the matchMedia check resolves on
// mount -- defaults to false (assume motion is fine) to match most
// callers, but Quote.jsx's heavier pinned/scrubbed sequence deliberately
// starts `true` (assume reduced) to avoid a first-paint flash of the
// enhanced branch.
export default function useReducedMotion(initial = false) {
  const [reduceMotion, setReduceMotion] = useState(initial);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return reduceMotion;
}

"use client";

import { useEffect, useState } from "react";

// Live prefers-reduced-motion value. `initial` is used until matchMedia
// resolves on mount; pass true for heavy pinned sequences to avoid a
// first-paint flash.
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

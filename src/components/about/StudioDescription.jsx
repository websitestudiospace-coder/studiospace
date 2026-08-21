"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const INK = "#2B2622";

// TODO: placeholder copy -- swap in the client's real studio description
// once provided. Structure/styling below already matches the site's
// established system (About.jsx's eyebrow + body treatment).
export default function StudioDescription() {
  const sectionRef = useRef(null);
  const eyebrowRef = useRef(null);
  const bodyRef = useRef(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    // One-shot reveal (not scroll-scrubbed) -- same Phase 3 pattern as
    // Press/Footer: this section doesn't need to feel scroll-locked, it
    // just plays once as it enters the viewport. Still waits for
    // "preloader:complete" since "top 80%" is measured against this
    // section's own position, which depends on AboutHero above it already
    // being in its final, settled (pinned) layout.
    let ctx;

    const setup = () => {
      ctx = gsap.context(() => {
        gsap.set(eyebrowRef.current, { opacity: 0, y: 24 });
        gsap.set(bodyRef.current, { opacity: 0, y: 24 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });

        tl.to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0);
        tl.to(bodyRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.15);
      }, sectionRef);
    };

    if (window.__preloaderDone) {
      setup();
    } else {
      window.addEventListener("preloader:complete", setup, { once: true });
    }

    return () => {
      ctx?.revert();
      window.removeEventListener("preloader:complete", setup);
    };
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className="w-full px-6 py-16 md:px-16 md:py-24"
      style={{ backgroundColor: CREAM }}
    >
      <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center text-center">
        <p
          ref={eyebrowRef}
          className="text-xs uppercase tracking-[0.2em] md:text-sm"
          style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.6 }}
        >
          Our Studio
        </p>
        <p
          ref={bodyRef}
          className="mt-6 max-w-2xl text-sm md:text-base"
          style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.65 }}
        >
          Studio description content goes here -- pending final copy from the
          client. This paragraph will introduce the studio&rsquo;s philosophy
          and approach to architecture and interior design once the real text
          is provided.
        </p>
      </div>
    </section>
  );
}

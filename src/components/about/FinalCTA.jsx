"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const INK = "#2B2622";
const MAROON = "#6E1F24";

export default function FinalCTA() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const bodyRef = useRef(null);
  const buttonRef = useRef(null);
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
    // Press/Footer.
    let ctx;

    const setup = () => {
      ctx = gsap.context(() => {
        gsap.set(headingRef.current, { opacity: 0, y: 24 });
        gsap.set(bodyRef.current, { opacity: 0, y: 24 });
        gsap.set(buttonRef.current, { opacity: 0, y: 24 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });

        tl.to(headingRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0);
        tl.to(bodyRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.15);
        tl.to(buttonRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.3);
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
    // Ink background -- deliberately matches Footer.jsx immediately below
    // it, so the two read as one continuous dark close to the page rather
    // than a cream section sitting awkwardly between AboutHero/StudioDescription's
    // cream run and the Footer's own ink.
    <section
      ref={sectionRef}
      className="flex w-full flex-col items-center px-6 py-20 text-center md:px-16 md:py-28"
      style={{ backgroundColor: INK }}
    >
      <h2
        ref={headingRef}
        className="max-w-2xl text-[32px] md:text-[48px]"
        style={{ fontFamily: "var(--font-agatho)", color: CREAM, lineHeight: 1.15 }}
      >
        Let&rsquo;s build something together.
      </h2>
      <p
        ref={bodyRef}
        className="mt-4 max-w-xl text-sm md:text-base"
        style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.65 }}
      >
        Tell us about your project and we&rsquo;ll get back to you to start
        the conversation.
      </p>
      <div ref={buttonRef} className="mt-8">
        <Link
          href="/contact"
          className="inline-block px-8 py-3.5 text-sm uppercase tracking-[0.15em] transition-opacity duration-200 ease-out hover:opacity-90"
          style={{ backgroundColor: MAROON, color: CREAM, fontFamily: "var(--font-manrope)" }}
        >
          Inquire
        </Link>
      </div>
    </section>
  );
}

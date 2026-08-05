
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";

const CREAM = "#F7EFE4";
const MAROON = "#6E1F24";

const HEADLINE_LINES = ["Timeless", "Architecture.", "Tailored Living."];

export default function Hero() {
  const lineRefs = useRef([]);
  const subRef = useRef(null);
  const ctaRef = useRef(null);
  const scrollRef = useRef(null);
  const arrowRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const reveal = () => {
      if (hasAnimated.current) return;
      hasAnimated.current = true;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduceMotion) {
        gsap.set(lineRefs.current, { yPercent: 0 });
        gsap.set([subRef.current, ctaRef.current, scrollRef.current], {
          opacity: 1,
          y: 0,
        });
        return;
      }

      // The Preloader overlay fully covers the page until this fires, so
      // there's no pre-JS "hidden" CSS state to fight with — GSAP owns
      // these properties from the very first render.
      gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .fromTo(
          lineRefs.current,
          { yPercent: 110 },
          { yPercent: 0, duration: 1, stagger: 0.12 }
        )
        .fromTo(
          subRef.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          "-=0.4"
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          "-=0.35"
        )
        .fromTo(
          scrollRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.8, ease: "power1.out" },
          "-=0.3"
        )
        .to(arrowRef.current, {
          y: 6,
          duration: 1.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
    };

    // The preloader's own animation runs ~3.2s; the fallback only needs to
    // fire if the "preloader:complete" event is somehow missed.
    if (typeof window !== "undefined" && window.__preloaderDone) {
      reveal();
      return;
    }

    window.addEventListener("preloader:complete", reveal);
    const fallback = setTimeout(reveal, 4000);

    return () => {
      window.removeEventListener("preloader:complete", reveal);
      clearTimeout(fallback);
    };
  }, []);

  return (
    <section className="relative h-[100svh] w-full overflow-hidden">
      <Image
        src="/images/hero/hero-1.jpg"
        alt="Studio Splace — architecture and interiors"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(43,38,34,0.75) 0%, rgba(43,38,34,0.35) 50%, rgba(43,38,34,0.12) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(43,38,34,0.55) 0%, rgba(43,38,34,0) 35%)",
        }}
      />

      <div
        ref={scrollRef}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span
          className="text-[12px] uppercase tracking-[0.15em]"
          style={{ color: CREAM, fontFamily: "var(--font-agatho)" }}
        >
          Scroll
        </span>
        <svg
          ref={arrowRef}
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke={CREAM}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 5l5 5 5-5" />
        </svg>
      </div>

      <div className="absolute inset-x-0 bottom-0 px-6 pb-16 md:px-14 md:pb-20">
        <div className="max-w-3xl">
          <h1 className="mb-6" style={{ fontFamily: "var(--font-juana)" }}>
            {HEADLINE_LINES.map((line, i) => (
              <span
                key={line}
                className="block overflow-hidden"
                style={{
                  fontSize: "clamp(2.5rem, 6.5vw, 5.5rem)",
                  paddingBottom: "0.15em",
                  marginBottom: "-0.15em",
                }}
              >
                <span
                  ref={(el) => (lineRefs.current[i] = el)}
                  className="block"
                  style={{
                    fontSize: "clamp(2.5rem, 6.5vw, 5.5rem)",
                    fontWeight: 400,
                    lineHeight: 1.2,
                    color: CREAM,
                  }}
                >
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <p
            ref={subRef}
            className="mb-8 max-w-md text-[15px] uppercase tracking-[0.15em]"
            style={{ color: CREAM, fontFamily: "var(--font-corporate)" }}
          >
            Crafting warm, considered spaces where architecture and everyday
            life meet.
          </p>

          <div ref={ctaRef} className="flex flex-wrap items-center gap-6">
            <Link
              href="/projects"
              className="px-7 py-3 text-[14px] uppercase tracking-[0.15em] transition-opacity hover:opacity-90"
              style={{
                backgroundColor: MAROON,
                color: CREAM,
                fontFamily: "var(--font-agatho)",
              }}
            >
              View Projects
            </Link>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 text-[14px] uppercase tracking-[0.15em]"
              style={{ color: CREAM, fontFamily: "var(--font-agatho)" }}
            >
              Begin Your Project
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

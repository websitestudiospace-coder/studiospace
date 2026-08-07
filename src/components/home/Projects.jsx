"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const INK = "#2B2622";

const PROJECTS = [
  { name: "The Modern Classical Home", image: "/images/projects/project-1.jpg" },
  { name: "The Modern Organic Home", image: "/images/projects/project-2.jpg" },
  { name: "The Neo Colonial Home", image: "/images/projects/project-3.jpg" },
];

export default function Projects() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const seeAllRef = useRef(null);
  const cardRefs = useRef([]);
  const ctaRef = useRef(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [failedImages, setFailedImages] = useState(() => new Set());

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const cards = cardRefs.current.filter(Boolean);

    // Everything in this section -- the whole-section rise/fade entrance,
    // the heading/CTA reveal, and the card stagger -- lives on ONE
    // timeline driven by ONE ScrollTrigger. That's required, not just
    // tidy: the entrance transforms sectionRef itself, and cards sit
    // inside it. If cards owned their own separate ScrollTrigger the way
    // they briefly did, that second trigger would cache each card's
    // start/end position against whatever sectionRef's entrance transform
    // happened to be at refresh time (page load, pre-scroll) -- the exact
    // "bounce back" bug from the Hero->Quote handoff (see
    // HeroQuoteTransition.jsx), just relocated to this section. Folding
    // every target into this single scrub timeline means there's no second
    // cached trigger to go stale.
    const ctx = gsap.context(() => {
      gsap.set(sectionRef.current, { opacity: 0, yPercent: 8 });
      gsap.set([headingRef.current, seeAllRef.current], { opacity: 0, y: 30 });
      gsap.set(cards, { opacity: 0, y: 28 });
      gsap.set(ctaRef.current, { opacity: 0, y: 20 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "top 50%",
          scrub: 0.5,
        },
      });

      tl.to(
        sectionRef.current,
        { opacity: 1, yPercent: 0, ease: "none", duration: 1 },
        0
      );
      tl.to(
        [headingRef.current, seeAllRef.current],
        { opacity: 1, y: 0, ease: "none", duration: 0.45, stagger: 0.08 },
        0.1
      );
      tl.to(
        cards,
        { opacity: 1, y: 0, ease: "none", duration: 0.35, stagger: 0.1 },
        0.3
      );
      tl.to(
        ctaRef.current,
        { opacity: 1, y: 0, ease: "none", duration: 0.25 },
        0.72
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className="w-full px-6 py-12 md:px-16 md:py-[100px]"
      style={{ backgroundColor: CREAM }}
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:mb-16 md:flex-row md:items-end">
          <h2
            ref={headingRef}
            style={{
              fontFamily: "var(--font-agatho)",
              fontSize: "clamp(32px, 5vw, 56px)",
              lineHeight: 1.1,
              color: INK,
            }}
          >
            Our Projects
          </h2>
          <Link
            ref={seeAllRef}
            href="/projects"
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] md:text-sm"
            style={{ fontFamily: "var(--font-manrope)", color: INK }}
          >
            <span className="border-b border-transparent pb-1 transition-colors duration-300 group-hover:border-current">
              See All
            </span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {PROJECTS.map((project, i) => (
            <Link
              key={project.name}
              href="/projects"
              ref={(el) => {
                if (el) cardRefs.current[i] = el;
              }}
              className="group relative block aspect-[4/5] w-full overflow-hidden rounded-[8px]"
            >
              {failedImages.has(i) ? (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${INK} 0%, #5C5347 100%)`,
                  }}
                />
              ) : (
                <Image
                  src={project.image}
                  alt={project.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  onError={() =>
                    setFailedImages((prev) => new Set(prev).add(i))
                  }
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <p
                className="absolute bottom-6 left-6 text-white"
                style={{
                  fontFamily: "var(--font-manrope)",
                  fontSize: "28px",
                  fontWeight: 700,
                }}
              >
                {project.name}
              </p>
            </Link>
          ))}
        </div>

        <div ref={ctaRef} className="mt-14 flex justify-center md:mt-20">
          {/* TODO: replace with popup form once fields are finalized */}
          <Link
            href="/contact"
            className="inline-block rounded-full border px-8 py-4 text-center text-sm uppercase tracking-[0.1em] transition-opacity duration-300 hover:opacity-80 md:text-base"
            style={{
              fontFamily: "var(--font-manrope)",
              color: INK,
              borderColor: INK,
            }}
          >
            Let&apos;s create a space that feels like you! Start your project
            here
          </Link>
        </div>
      </div>
    </section>
  );
}

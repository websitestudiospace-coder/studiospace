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

// Heading + "See All" row. Part of the same pinned/scrubbed sequence as the
// cards and CTA -- it's the first two steps of that single timeline (see
// Projects() below), so it lives inside the sticky viewport right alongside
// the grid rather than in its own separate static section.
function ProjectsHeader({ headingRef, seeAllRef }) {
  return (
    <div className="mb-10 flex w-full flex-col items-start justify-between gap-4 md:mb-16 md:flex-row md:items-end">
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
  );
}

function ProjectsGrid({ cardRefs, ctaRef }) {
  const [failedImages, setFailedImages] = useState(() => new Set());

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
        {PROJECTS.map((project, i) => (
          <Link
            key={project.name}
            href="/projects"
            ref={(el) => {
              if (el && cardRefs) cardRefs.current[i] = el;
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
                fontSize: "clamp(16px, 1.8vw, 22px)",
                fontWeight: 700,
              }}
            >
              {project.name}
            </p>
          </Link>
        ))}
      </div>

      <div ref={ctaRef} className="mt-14 flex justify-start md:mt-20">
        {/* TODO: replace with popup form once fields are finalized */}
        <Link
          href="/contact"
          className="inline-block rounded-full px-4 py-2 text-xs transition-opacity duration-300 hover:opacity-70"
          style={{
            fontFamily: "var(--font-manrope)",
            color: INK,
            backgroundColor: "rgba(43, 38, 34, 0.06)",
          }}
        >
          Let&apos;s create a space that feels like you! Start your project
          here
        </Link>
      </div>
    </>
  );
}

export default function Projects() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const seeAllRef = useRef(null);
  const cardRefs = useRef([]);
  const ctaRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mobileMql = window.matchMedia("(max-width: 767px)");
    const motionMql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMobile = () => setIsMobile(mobileMql.matches);
    const updateMotion = () => setReduceMotion(motionMql.matches);
    updateMobile();
    updateMotion();
    mobileMql.addEventListener("change", updateMobile);
    motionMql.addEventListener("change", updateMotion);
    return () => {
      mobileMql.removeEventListener("change", updateMobile);
      motionMql.removeEventListener("change", updateMotion);
    };
  }, []);

  const enhanced = !isMobile && !reduceMotion;

  useEffect(() => {
    if (!enhanced) return;

    // Same reasoning as About.jsx: this section is now pinned (sticky) with
    // a "top top" -> "bottom bottom" ScrollTrigger, so its measured start/end
    // depend on every section above it already being in its final, settled
    // layout. Creating the trigger before Preloader's intro finishes (and
    // before Hero/Quote/About's own mount-time layout upgrades have landed)
    // bakes in stale positions that a later ScrollTrigger.refresh() won't
    // fix. Wait for "preloader:complete" the same way About.jsx does.
    let ctx;

    const setup = () => {
      const cards = cardRefs.current.filter(Boolean);

      ctx = gsap.context(() => {
        // ONE timeline, ONE ScrollTrigger on the section's own root. Every
        // phase below is a tween positioned at an absolute fraction of this
        // single scrub -- heading, "See All", cards, and the CTA never get
        // their own independent triggers, because the section itself
        // defines the scroll range they all animate against (the same
        // golden rule as the card-stagger fix and About's image-grow
        // sequence).
        gsap.set([headingRef.current, seeAllRef.current], {
          opacity: 0,
          y: 28,
        });
        gsap.set(cards, { scale: 1.15, opacity: 0, y: 28 });
        gsap.set(ctaRef.current, { opacity: 0, y: 20 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        });

        // Anchor the timeline to exactly 1 "unit" so every position below
        // reads as a literal fraction of the pinned scroll range. Six steps
        // now share that range in equal sixths: heading, "See All", the
        // three cards, then the CTA.
        tl.to({}, { duration: 1 }, 0);

        const STEP = 1 / 6;

        // 0%-16.7%: "Our Projects" heading reveals.
        tl.to(
          headingRef.current,
          { opacity: 1, y: 0, ease: "none", duration: STEP },
          0 * STEP
        );

        // 16.7%-33.3%: "See All" link reveals.
        tl.to(
          seeAllRef.current,
          { opacity: 1, y: 0, ease: "none", duration: STEP },
          1 * STEP
        );

        // 33.3%-50%: Card 1 settles.
        tl.to(
          cards[0],
          { scale: 1, opacity: 1, y: 0, ease: "none", duration: STEP },
          2 * STEP
        );

        // 50%-66.7%: Card 2 settles.
        tl.to(
          cards[1],
          { scale: 1, opacity: 1, y: 0, ease: "none", duration: STEP },
          3 * STEP
        );

        // 66.7%-83.3%: Card 3 settles.
        tl.to(
          cards[2],
          { scale: 1, opacity: 1, y: 0, ease: "none", duration: STEP },
          4 * STEP
        );

        // 83.3%-100%: CTA pill reveals.
        tl.to(
          ctaRef.current,
          { opacity: 1, y: 0, ease: "none", duration: STEP },
          5 * STEP
        );
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
  }, [enhanced]);

  if (!enhanced) {
    return (
      <section
        className="w-full px-6 py-12 md:px-16 md:py-[100px]"
        style={{ backgroundColor: CREAM }}
      >
        <div className="mx-auto w-full max-w-[1100px]">
          <ProjectsHeader />
          <ProjectsGrid cardRefs={null} ctaRef={{ current: null }} />
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative w-full" style={{ height: "400vh" }}>
      <div
        className="sticky top-0 flex h-screen w-full flex-col justify-center overflow-hidden px-6 md:px-16"
        style={{ backgroundColor: CREAM }}
      >
        <div className="mx-auto w-full max-w-[1100px]">
          <ProjectsHeader headingRef={headingRef} seeAllRef={seeAllRef} />
          <ProjectsGrid cardRefs={cardRefs} ctaRef={ctaRef} />
        </div>
      </div>
    </section>
  );
}

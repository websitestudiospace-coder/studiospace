"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROJECTS as PROJECT_DATA } from "@/data/projects";
import Button from "@/components/ui/Button";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const INK = "#2B2622";

// Curated cover images for these 3 featured cards (distinct from each
// project's own gallery cover) -- slug is looked up from @/data/projects by
// name so each card links to its real /projects/[slug] page instead of
// duplicating slugs here by hand.
const PROJECTS = [
  { name: "The Modern Organic Home", image: "/images/projects/project-2.jpg" },
  { name: "The Neo Colonial Home", image: "/images/projects/project-3.jpg" },
  { name: "The Modern Classical Home", image: "/images/projects/project-1.jpg" },
].map((project) => ({
  ...project,
  slug: PROJECT_DATA.find((p) => p.name === project.name)?.slug ?? "",
}));

// Heading + "See All" row. Part of the same pinned/scrubbed sequence as the
// cards and CTA -- it's the first two steps of that single timeline (see
// Projects() below), so it lives inside the sticky viewport right alongside
// the grid rather than in its own separate static section.
function ProjectsHeader({ headingRef, seeAllRef }) {
  return (
    <div className="mb-10 flex w-full flex-col items-start justify-between gap-4 md:mb-16 md:flex-row md:items-end">
      <h2
        ref={headingRef}
        className="text-[32px] md:text-[48px]"
        style={{
          fontFamily: "var(--font-agatho)",
          lineHeight: 1.1,
          color: INK,
        }}
      >
        Our Projects
      </h2>
      <Link
        ref={seeAllRef}
        href="/projects"
        className="hit-area group inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] md:text-sm"
        style={{ fontFamily: "var(--font-manrope)", color: INK }}
      >
        <span className="border-b border-transparent pb-1 transition-colors duration-200 ease-out group-hover:border-current">
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
      {/* grid-cols-1 at mobile, matching /projects index's ProjectsGrid --
          the enhanced/pinned sequence below is desktop-only (see the
          isDesktop check in Projects()), so on mobile this always renders
          through the plain, non-pinned "!enhanced" branch with normal
          document flow. No fixed-height sticky container to overflow, so
          full-width single-column cards are safe here. */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-8">
        {PROJECTS.map((project, i) => (
          <Link
            key={project.name}
            href={project.slug ? `/projects/${project.slug}` : "/projects"}
            ref={(el) => {
              if (el && cardRefs) cardRefs.current[i] = el;
            }}
            className="group relative block aspect-[4/5] w-full overflow-hidden rounded-[8px]"
          >
            {failedImages.has(i) ? (
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${INK} 0%, rgba(43,38,34,0.6) 100%)`,
                }}
              />
            ) : (
              <Image
                src={project.image}
                alt={project.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                // Only the first card is above-the-fold-adjacent priority
                // content -- cards 2/3 fall through to next/image's default
                // native lazy loading like every other below-fold image.
                priority={i === 0}
                className="object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03]"
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
        <Button href="/contact" variant="secondary">
          Let&apos;s create a space that feels like you! Start your project
          here
        </Button>
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
  const reduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Desktop-only: the pinned/scrubbed sequence holds its grid inside a fixed
  // h-screen sticky viewport with overflow-hidden, which only has room for
  // the 3-column desktop layout. Mobile's single-column stacked cards would
  // be taller than one screen and get clipped, so mobile always falls
  // through to the plain "!enhanced" branch below (normal document flow,
  // same as /projects index).
  const enhanced = !reduceMotion && isDesktop;

  // Same reasoning as About.jsx: this section is now pinned (sticky) with
  // a "top top" -> "bottom bottom" ScrollTrigger, so its measured start/end
  // depend on every section above it already being in its final, settled
  // layout. Creating the trigger before Preloader's intro finishes (and
  // before Hero/Quote/About's own mount-time layout upgrades have landed)
  // bakes in stale positions that a later ScrollTrigger.refresh() won't
  // fix. Wait for "preloader:complete" the same way About.jsx does.
  usePreloaderGate(
    () => {
      const cards = cardRefs.current.filter(Boolean);

      const ctx = gsap.context(() => {
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
        // share the first 85% of that range in equal sixths (heading,
        // "See All", the three cards, then the CTA), leaving a ~15% settle
        // buffer before the pin releases -- previously all six steps
        // divided the full range with the CTA landing exactly at 100%,
        // leaving no buffer at all.
        tl.to({}, { duration: 1 }, 0);

        const STEP = 0.85 / 6;

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

      return () => ctx.revert();
    },
    [],
    enhanced
  );

  if (!enhanced) {
    return (
      <section
        className="w-full px-6 py-12 md:px-16 md:py-24"
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
    <section ref={sectionRef} className="relative w-full" style={{ height: "150vh" }}>
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

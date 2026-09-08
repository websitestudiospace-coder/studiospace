"use client";

import { useRef, useState } from "react";
import { CldImage } from "next-cloudinary";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const INK = "#2B2622";

export default function ProjectsGrid({ projects }) {
  const gridRef = useRef(null);
  const cardRefs = useRef([]);
  const [failedImages, setFailedImages] = useState(() => new Set());
  const reduceMotion = useReducedMotion();

  // Gated behind "preloader:complete" like every other scroll-triggered
  // reveal in the app -- this grid sits directly below ProjectsHero's own
  // pinned 160vh sequence, so its "top 85%" measurement is subject to the
  // same pre-settle layout staleness that motivated the gate everywhere
  // else (see ProjectsHero.jsx).
  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        const cards = cardRefs.current.filter(Boolean);
        gsap.set(cards, { opacity: 0, y: 32 });

        gsap.to(cards, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      }, gridRef);

      return () => ctx.revert();
    },
    [],
    !reduceMotion
  );

  // ProjectsHero's sticky wrapper stays a fixed 100vh (needed for its native
  // `position: sticky` release to line up with the scrub, see that file's own
  // comment) even though its content shrinks to a much smaller settled row
  // -- that mismatch leaves blank cream inside the pin, which reads as an
  // oversized gap once the grid appears below it. Pulling this section up
  // (same idea as Quote -> About on the homepage) fixes the gap at rest, but
  // unlike Quote's case the blank space here isn't a one-time dead scroll
  // tail -- it's present for nearly the whole pin, growing as the hero
  // shrinks. A margin sized to close the gap completely at rest (e.g.
  // calc(256px-100vh), tried first) has to be so large it pulls the grid
  // into view while the heading is still huge and centered, well before the
  // shrink finishes -- cards visibly overlapping the headline mid-scroll.
  // -50vh is deliberately much smaller and was tuned against the actual
  // transition (checked every ~10% of the pin's scroll, at both 1440px and
  // 390px): the grid only starts entering the viewport once the heading is
  // already legibly small and on its way to the corner, well after the
  // "huge, centered" phase, so nothing ever collides, at the cost of a
  // moderate (not minimal) gap at rest -- still roughly half the original,
  // uncorrected void. Only applies when the pin animation is actually
  // running (matches ProjectsHero's `enhanced` = `!reduceMotion`).
  const pullUpClass = reduceMotion ? "" : "mt-[-50vh]";

  return (
    <section
      ref={gridRef}
      className={`w-full px-6 pb-24 md:px-16 md:pb-32 ${pullUpClass}`}
      style={{ backgroundColor: CREAM }}
    >
      <div className="mx-auto grid w-full max-w-[1100px] grid-cols-1 gap-8 md:grid-cols-3 md:gap-8">
        {projects.map((project, i) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="group relative block aspect-[4/5] w-full overflow-hidden rounded-[8px]"
            style={reduceMotion ? undefined : { opacity: 0 }}
          >
            {failedImages.has(i) || !project.cover ? (
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${INK} 0%, rgba(43,38,34,0.6) 100%)`,
                }}
              />
            ) : (
              <CldImage
                src={project.cover}
                alt={project.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03]"
                onError={() => setFailedImages((prev) => new Set(prev).add(i))}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <p
              className="absolute bottom-6 left-6 text-white"
              style={{
                fontFamily: "var(--font-manrope)",
                fontSize: "clamp(13px, 1.2vw, 17px)",
                fontWeight: 700,
              }}
            >
              {project.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

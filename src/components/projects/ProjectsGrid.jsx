"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";
import { SETTLED_HEIGHT_DESKTOP } from "@/components/projects/ProjectsHero";
import ProjectCard from "@/components/projects/ProjectCard";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";

// Desktop: the grid rests this far below the top of the viewport once
// ProjectsHero's pin releases -- just under its settled heading row
// (SETTLED_HEIGHT_DESKTOP) plus a small gap, i.e. ~64px below the heading's
// text. Must match the md:mt-[calc(168px-100vh)] class below (Tailwind
// needs that value written out literally).
const DESKTOP_GRID_TOP_PX = SETTLED_HEIGHT_DESKTOP + 8;
// ProjectsHero finishes shrinking at 85% of its pinned scroll (60vh), so
// the grid is still 15% of 60vh = 9vh below its resting spot at that point.
const HERO_SETTLED_REMAINING_VH = 0.09;

export default function ProjectsGrid({ projects }) {
  const gridRef = useRef(null);
  const cardRefs = useRef([]);
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
        // pointerEvents: on desktop the (still hidden) cards sit under the
        // pinned hero until they reveal -- don't let them catch clicks.
        gsap.set(cards, { opacity: 0, y: 32, pointerEvents: "none" });

        const isDesktop = () => window.matchMedia("(min-width: 768px)").matches;
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          pointerEvents: "auto",
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: gridRef.current,
            // Desktop: reveal exactly when the hero heading has finished
            // shrinking into its corner (the grid is pulled up under the hero,
            // so a plain "top 85%" would fade cards in over the still-large
            // heading). Mobile keeps its original trigger.
            start: () =>
              isDesktop()
                ? `top ${DESKTOP_GRID_TOP_PX + window.innerHeight * HERO_SETTLED_REMAINING_VH}px`
                : "top 85%",
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
  //
  // Desktop now pulls the grid all the way up to just below the settled
  // heading row (md:mt-[calc(168px-100vh)], see DESKTOP_GRID_TOP_PX) -- the
  // -50vh compromise still left ~345px (1440px) to ~435px (1920px) of blank
  // cream. The overlap problem described above is avoided by timing
  // instead: the cards stay hidden (and unclickable) until the heading has
  // settled, then reveal in place (see the reveal trigger above). Mobile
  // keeps -50vh.
  const pullUpClass = reduceMotion ? "" : "mt-[-50vh] md:mt-[calc(168px-100vh)]";

  return (
    <section
      ref={gridRef}
      className={`w-full px-6 pb-16 md:px-16 md:pb-32 ${pullUpClass}`}
      style={{ backgroundColor: CREAM }}
    >
      <div className="mx-auto grid w-full max-w-[1100px] grid-cols-1 gap-8 md:grid-cols-3 md:gap-8">
        {projects.map((project, i) => (
          <ProjectCard
            key={project.slug}
            href={`/projects/${project.slug}`}
            name={project.name}
            location={project.location}
            image={project.cover}
            cardRef={(el) => {
              cardRefs.current[i] = el;
            }}
            style={reduceMotion ? undefined : { opacity: 0 }}
          />
        ))}
      </div>
    </section>
  );
}

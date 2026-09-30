"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";
import { SETTLED_HEIGHT_DESKTOP, SETTLED_HEIGHT_MOBILE } from "@/components/projects/ProjectsHero";
import ProjectCard from "@/components/projects/ProjectCard";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";

// Where the grid rests once ProjectsHero's pin releases, just under its
// settled heading row. Must match mt-[calc(124px-100vh)] and
// md:mt-[calc(168px-100vh)] below -- Tailwind needs the values written out.
const GRID_TOP_PX_DESKTOP = SETTLED_HEIGHT_DESKTOP + 8;
const GRID_TOP_PX_MOBILE = SETTLED_HEIGHT_MOBILE + 16;
// ProjectsHero finishes shrinking at 85% of its pinned scroll (60vh), so
// the grid is still 15% of 60vh = 9vh below its resting spot at that point.
const HERO_SETTLED_REMAINING_VH = 0.09;

export default function ProjectsGrid({ projects }) {
  const gridRef = useRef(null);
  const cardRefs = useRef([]);
  const reduceMotion = useReducedMotion();

  // Waits for the preloader: this sits below ProjectsHero's pinned sequence,
  // so "top 85%" needs settled layout.
  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        const cards = cardRefs.current.filter(Boolean);
        // pointerEvents: the (still hidden) cards sit under the pinned hero
        // until they reveal -- don't let them catch clicks.
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
            // Reveal only once the hero heading has shrunk into its corner
            // (the grid is pulled up under the hero).
            start: () =>
              `top ${(isDesktop() ? GRID_TOP_PX_DESKTOP : GRID_TOP_PX_MOBILE) + window.innerHeight * HERO_SETTLED_REMAINING_VH}px`,
            // Reverse on leaveBack: scrolling back up must hide the cards
            // again, or they paint over the hero as it grows back.
            toggleActions: "play none none reverse",
          },
        });
      }, gridRef);

      return () => ctx.revert();
    },
    [],
    !reduceMotion
  );

  // ProjectsHero's sticky wrapper stays 100vh while its content shrinks, which
  // leaves blank space inside the pin. Pull the grid up to just below the
  // settled heading row; the cards stay hidden until the heading has settled
  // (see the trigger above). Only while the pin animation runs.
  const pullUpClass = reduceMotion ? "" : "mt-[calc(124px-100vh)] md:mt-[calc(168px-100vh)]";

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

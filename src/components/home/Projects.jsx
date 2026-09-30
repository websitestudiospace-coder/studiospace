"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROJECTS as PROJECT_DATA } from "@/data/projects";
import Button from "@/components/ui/Button";
import ProjectCard from "@/components/projects/ProjectCard";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const INK = "#2B2622";

// Curated images for the three featured cards. Each is a copy of a photo from
// that project's gallery (project-2 = Neo Colonial #3, project-3 = Modern
// Organic #2, project-1 = Modern Classical #8) -- keep names and images
// paired. Slugs are looked up by name from @/data/projects.
const PROJECTS = [
  { name: "The Neo Colonial Home", image: "/images/projects/project-2.jpg" },
  { name: "The Modern Organic Home", image: "/images/projects/project-3.jpg" },
  { name: "The Modern Classical Home", image: "/images/projects/project-1.jpg" },
].map((project) => {
  const data = PROJECT_DATA.find((p) => p.name === project.name);
  return { ...project, slug: data?.slug ?? "", location: data?.location ?? null };
});

// Heading + "See All" row; the first two steps of the pinned timeline.
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
  return (
    <>
      {/* Single column on mobile (the pinned sequence is desktop-only). */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-8">
        {/* Same card component as the /projects listing. */}
        {PROJECTS.map((project, i) => (
          <ProjectCard
            key={project.name}
            href={project.slug ? `/projects/${project.slug}` : "/projects"}
            name={project.name}
            location={project.location}
            image={project.image}
            // Only the first card is loaded eagerly.
            priority={i === 0}
            cardRef={(el) => {
              if (el && cardRefs) cardRefs.current[i] = el;
            }}
          />
        ))}
      </div>

      <div ref={ctaRef} className="mt-14 flex justify-start md:mt-20">
        {/* TODO: replace with a popup form once fields are finalized. */}
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

  // Desktop-only pin: stacked mobile cards wouldn't fit in one sticky screen.
  const enhanced = !reduceMotion && isDesktop;

  // Wait for the preloader so the pinned trigger measures settled layout.
  usePreloaderGate(
    () => {
      const cards = cardRefs.current.filter(Boolean);

      const ctx = gsap.context(() => {
        // One timeline and one ScrollTrigger for the whole section.
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

        // Timeline length pinned to 1. Six steps (heading, "See All", three
        // cards, CTA) share the first 85% in equal sixths; the last 15% is a
        // settle before the pin releases.
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

  // Mobile (no pin): heading and "See All" fade up, each card scales
  // 1.15 -> 1 as it enters, then the CTA fades in. Reduced motion is static.
  const mobileAnim = !reduceMotion && !isDesktop;

  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        const reveal = (targets, from, trigger) =>
          gsap.from(targets, {
            ...from,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: { trigger, start: "top 85%", toggleActions: "play none none none" },
          });

        reveal([headingRef.current, seeAllRef.current], { opacity: 0, y: 24 }, headingRef.current);
        cardRefs.current.filter(Boolean).forEach((card) => {
          reveal(card, { opacity: 0, scale: 1.15 }, card);
        });
        reveal(ctaRef.current, { opacity: 0, y: 20 }, ctaRef.current);
      }, sectionRef);

      return () => ctx.revert();
    },
    [],
    mobileAnim
  );

  if (!enhanced) {
    return (
      // overflow-x-clip: a full-width card starting at scale 1.15 is
      // briefly wider than the phone screen.
      <section
        ref={sectionRef}
        className="w-full overflow-x-clip px-6 py-16 md:px-16 md:py-24"
        style={{ backgroundColor: CREAM }}
      >
        <div className="mx-auto w-full max-w-[1100px]">
          <ProjectsHeader headingRef={headingRef} seeAllRef={seeAllRef} />
          <ProjectsGrid cardRefs={cardRefs} ctaRef={ctaRef} />
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

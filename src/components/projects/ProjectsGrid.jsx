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

  return (
    <section
      ref={gridRef}
      className="w-full px-6 pb-24 md:px-16 md:pb-32"
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

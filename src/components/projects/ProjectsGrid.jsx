"use client";

import { useEffect, useRef, useState } from "react";
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

// Small "view project" glyph shown above the name in the hover overlay --
// this site has no icon library/component (confirmed via grep: the only
// existing inline SVGs are ProjectGallery's and ProjectDescriptionModal's
// close icons), so this follows their exact convention instead of pulling
// in a new dependency: plain line SVG, strokeWidth 1.5, round caps/joins,
// stroke="currentColor", aria-hidden.
function ViewProjectIcon() {
  return (
    <span
      className="mb-2 flex h-8 w-8 items-center justify-center rounded-full border"
      style={{ borderColor: "rgba(247, 239, 228, 0.55)", color: CREAM }}
      aria-hidden="true"
    >
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
        <path
          d="M3 11L11 3M11 3H5M11 3V9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function ProjectsGrid({ projects }) {
  const gridRef = useRef(null);
  const cardRefs = useRef([]);
  const [failedImages, setFailedImages] = useState(() => new Set());
  const reduceMotion = useReducedMotion();

  // Real hover capability, not just viewport width -- a touch device with a
  // wide screen (a tablet in landscape, say) still can't hover, so this
  // checks `(hover: hover)` directly rather than a breakpoint. No existing
  // hover/touch-detection precedent anywhere else in this codebase
  // (confirmed via grep), so this follows the same local
  // useState+useEffect+matchMedia idiom About.jsx already uses for its own
  // `isDesktop` check, rather than introducing a new shared hook for one
  // caller. Starts `false` (assume no hover, i.e. the always-visible
  // fallback) until the check resolves on mount -- errs toward showing the
  // overlay first rather than risking a flash of hidden text on a touch
  // device, and this only affects the very first paint since the grid's
  // own cards are already gated behind the preloader.
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

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

  // Touch devices get the overlay permanently visible (there's no `:hover`
  // to reveal it on), but at a slightly lower opacity than the desktop
  // hover-in state -- a full-strength dark scrim sitting on every card at
  // once reads heavier scrolling a mobile grid (several cards visible in
  // the viewport simultaneously) than the same scrim appearing transiently
  // under a cursor on desktop, so this dials it back a touch rather than
  // matching the hover state 1:1. `reduceMotion` only removes the
  // transition itself on hover-capable devices -- the reveal-on-hover/
  // focus logic still works, it just snaps instead of easing.
  const overlayVisibilityClass = !canHover
    ? "opacity-90"
    : reduceMotion
      ? "opacity-0 group-hover:opacity-100 group-focus:opacity-100"
      : "opacity-0 translate-y-3 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-focus:opacity-100 group-focus:translate-y-0";

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
            {/* Clean by default -- no visible scrim/text until hover
                (or focus/touch, see overlayVisibilityClass above). Height
                is content-driven (icon + name + location + padding), not a
                fixed fraction of the card, so it reads as a bottom "strip"
                rather than covering half the photo. Ink-toned scrim (not
                black) per the brand-token rule -- rgba(43,38,34,...) is
                #2B2622 -- fading from solid-ish at the bottom edge to fully
                transparent above, with a real backdrop-filter blur over
                that same region for the frosted-glass look from the
                client's reference. */}
            <div
              className={`absolute inset-x-0 bottom-0 flex flex-col items-start justify-end px-5 pb-5 pt-10 md:px-6 md:pb-6 ${overlayVisibilityClass}`}
              style={{
                background:
                  "linear-gradient(to top, rgba(43,38,34,0.85) 0%, rgba(43,38,34,0.55) 55%, rgba(43,38,34,0) 100%)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
              }}
            >
              <ViewProjectIcon />
              <p
                style={{
                  fontFamily: "var(--font-manrope)",
                  color: CREAM,
                  fontSize: "clamp(13px, 1.2vw, 17px)",
                  fontWeight: 700,
                }}
              >
                {project.name}
              </p>
              {project.location ? (
                <p
                  className="mt-1"
                  style={{
                    fontFamily: "var(--font-manrope)",
                    color: CREAM,
                    opacity: 0.75,
                    fontSize: "clamp(11px, 1vw, 13px)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {project.location}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

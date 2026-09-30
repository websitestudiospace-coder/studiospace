"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const INK = "#2B2622";

// TODO: placeholder hero shot (a project photo) -- swap for a dedicated wide
// hero photo when the client provides one.
const HERO_IMAGE = "/images/projects/project-1.jpg";

// Settled height of the shrinking wrapper (a heading-row height). The image
// fills the wrapper, so it shrinks with it. Exported for ProjectsGrid, which
// sits its grid just below this row.
export const SETTLED_HEIGHT_DESKTOP = 160;
export const SETTLED_HEIGHT_MOBILE = 108;

// Heading font-size keyframes in px (GSAP can't tween clamp()). END matches
// ProjectsGrid's heading size. Mobile START is capped by viewport width so
// "OUR PROJECTS" never overflows a phone screen.
const HEADING_START_DESKTOP = 128;
const HEADING_START_MOBILE_CAP = 44;
const HEADING_END_DESKTOP = 56;
const HEADING_END_MOBILE = 32;

// Settled left inset so the heading lines up with ProjectsGrid's first
// column. The heading's wrapper is already centered at max-w-[1100px], so
// this is only the difference between the two left edges.
function computeHeadingInset(isDesktopViewport) {
  const vw = window.innerWidth;
  const pad = isDesktopViewport ? 64 : 24;
  const gridLeft = pad + Math.max(0, (vw - pad * 2 - 1100) / 2);
  const wrapperLeft = Math.max(0, (vw - 1100) / 2);
  return gridLeft - wrapperLeft;
}

export default function ProjectsHero() {
  const outerRef = useRef(null);
  const stickyRef = useRef(null);
  const shrinkRef = useRef(null);
  const imageRef = useRef(null);
  const headingRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  const enhanced = !reduceMotion;

  // Pinned "top top" -> "bottom bottom" trigger: wait for the preloader so
  // start/end are measured against settled layout.
  usePreloaderGate(
    () => {
      const settledHeight = isDesktop ? SETTLED_HEIGHT_DESKTOP : SETTLED_HEIGHT_MOBILE;
      const headingStart = isDesktop
        ? HEADING_START_DESKTOP
        : Math.min(HEADING_START_MOBILE_CAP, window.innerWidth * 0.11);
      const headingEnd = isDesktop ? HEADING_END_DESKTOP : HEADING_END_MOBILE;
      const headingInset = computeHeadingInset(isDesktop);

      const ctx = gsap.context(() => {
        // One timeline: wrapper height, image fade and heading position/size.
        // It shrinks the inner `shrinkRef`, not the sticky element itself:
        // a shrinking sticky box releases about a viewport late, leaving a
        // dead gap before the grid.
        gsap.set(shrinkRef.current, { height: "100vh" });
        gsap.set(headingRef.current, {
          top: "50%",
          left: "50%",
          xPercent: -50,
          yPercent: -50,
          fontSize: headingStart,
          color: CREAM,
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: outerRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        });

        tl.to({}, { duration: 1 }, 0);

        // 0%-75%: wrapper collapses to a heading-row height while the heading
        // moves from centered-large to left-aligned-small (vertical centering
        // follows from top:50%/yPercent:-50 on the shrinking parent).
        tl.to(
          shrinkRef.current,
          { height: `${settledHeight}px`, ease: "none", duration: 0.85 },
          0
        );
        tl.to(
          headingRef.current,
          {
            left: `${headingInset}px`,
            xPercent: 0,
            fontSize: headingEnd,
            ease: "none",
            duration: 0.85,
          },
          0
        );
        // Image fades out over the back half of the shrink; the heading
        // crossfades cream -> ink so it stays legible on both backgrounds.
        tl.to(imageRef.current, { opacity: 0, ease: "none", duration: 0.4 }, 0.45);
        tl.to(headingRef.current, { color: INK, ease: "none", duration: 0.4 }, 0.45);

        // 85%-100%: short hold before the pin releases.
      }, outerRef);

      return () => ctx.revert();
    },
    [isDesktop],
    enhanced
  );

  if (reduceMotion) {
    return (
      // Same container shape as ProjectsGrid so the heading lines up with its
      // first column.
      <section className="w-full px-6 pb-12 pt-16 md:px-16 md:pb-16 md:pt-24" style={{ backgroundColor: CREAM }}>
        <div className="mx-auto w-full max-w-[1100px]">
          <h1
            style={{
              fontFamily: "var(--font-agatho)",
              fontSize: "clamp(32px, 5vw, 56px)",
              lineHeight: 1.1,
              color: INK,
            }}
          >
            Our Projects
          </h1>
        </div>
      </section>
    );
  }

  return (
    <section ref={outerRef} className="relative w-full" style={{ height: "160vh" }}>
      <div
        ref={stickyRef}
        className="sticky top-0 w-full overflow-hidden"
        style={{ height: "100vh", backgroundColor: CREAM }}
      >
        <div ref={shrinkRef} className="relative w-full overflow-hidden">
          <div ref={imageRef} className="absolute inset-0 h-full w-full overflow-hidden">
            <Image
              src={HERO_IMAGE}
              alt="Studio SP_ACE Projects"
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/45" />
          </div>

          <div className="pointer-events-none absolute inset-0 mx-auto w-full max-w-[1100px] px-6 md:px-16">
            <h1
              ref={headingRef}
              className="absolute uppercase"
              style={{
                fontFamily: "var(--font-agatho)",
                lineHeight: 1.1,
                color: CREAM,
                whiteSpace: "nowrap",
              }}
            >
              Our Projects
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}

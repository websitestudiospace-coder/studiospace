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

// TODO: placeholder hero shot -- swap for a dedicated wide hero photo from
// the client once provided. Reusing a project image for now.
const HERO_IMAGE = "/images/projects/project-1.jpg";

// Settled height of the shrinking content once the shrink finishes -- a
// section-heading-row height, not a sliver. This wrapper's own height is
// what's tweened (not a separate image height), so the image -- sized via
// next/image's `fill` against this same wrapper -- shrinks with it for
// free, and nothing empty is left behind once the pin releases.
const SETTLED_HEIGHT_DESKTOP = 160;
const SETTLED_HEIGHT_MOBILE = 108;

// Heading font-size keyframes (px, tweened directly rather than via CSS
// clamp() since GSAP can't animate a clamp() formula) -- END matches
// ProjectsGrid's own heading treatment (clamp(32px, 5vw, 56px)) so the
// settled state reads as the same heading, just landed in place. Mobile
// START is capped and also scaled off viewport width (12-character
// "OUR PROJECTS" in Agatho overflows a phone-width viewport at any fixed
// size much above this once centered) -- verified against a 390px-wide
// screenshot.
const HEADING_START_DESKTOP = 128;
const HEADING_START_MOBILE_CAP = 44;
const HEADING_END_DESKTOP = 56;
const HEADING_END_MOBILE = 32;

// Settled left inset for the heading, computed to land exactly where
// ProjectsGrid's own `max-w-[1100px] mx-auto px-6 md:px-16` puts its content
// edge. An absolutely positioned child is offset from its containing
// block's padding EDGE, not its padding-adjusted content box, so the
// wrapper's Tailwind padding classes are invisible to the heading's own
// `left` -- this reproduces the same "pad, then center within what's left"
// math by hand instead.
function computeHeadingInset(isDesktopViewport) {
  const pad = isDesktopViewport ? 64 : 24;
  const available = window.innerWidth - pad * 2;
  return available > 1100 ? pad + (available - 1100) / 2 : pad;
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

  // Same reasoning as the homepage's pinned sections (About.jsx etc.):
  // this is a "top top" -> "bottom bottom" pinned ScrollTrigger, so its
  // measured start/end depend on layout having already settled. Wait for
  // "preloader:complete" (Preloader lives in the root layout, so it
  // mounts on every route, including this one) before measuring.
  usePreloaderGate(
    () => {
      const settledHeight = isDesktop ? SETTLED_HEIGHT_DESKTOP : SETTLED_HEIGHT_MOBILE;
      const headingStart = isDesktop
        ? HEADING_START_DESKTOP
        : Math.min(HEADING_START_MOBILE_CAP, window.innerWidth * 0.11);
      const headingEnd = isDesktop ? HEADING_END_DESKTOP : HEADING_END_MOBILE;
      const headingInset = computeHeadingInset(isDesktop);

      const ctx = gsap.context(() => {
        // ONE consolidated timeline: the shrink wrapper's own height, the
        // image's fade, and the heading's position/size all tween against
        // the same scrub -- never separate triggers. Note this animates
        // `shrinkRef` (an inner wrapper), not `stickyRef` itself -- the
        // sticky element's own box stays a constant 100vh the whole time.
        // Native position:sticky only releases once its (live) box's
        // bottom edge catches up with its containing block; if the sticky
        // element's own height were the thing shrinking down to a small
        // settled size, that catch-up would lag roughly a full viewport
        // height behind the shrink actually finishing, leaving a large
        // dead scroll gap before the grid appears. Keeping stickyRef's own
        // height fixed and shrinking an inner wrapper instead means the
        // sticky release lines up with the scrub's own end, right where
        // the grid should take over.
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

        // 0%-75%: wrapper collapses from a full screen down to a settled
        // header-row height (image shrinks along with it for free), while
        // the heading slides from centered-large to left-aligned-small --
        // vertical centering is never separately tweened, it falls out of
        // top:50%/yPercent:-50 recalculating against the shrinking parent
        // every frame.
        tl.to(
          shrinkRef.current,
          { height: `${settledHeight}px`, ease: "none", duration: 0.75 },
          0
        );
        tl.to(
          headingRef.current,
          {
            left: `${headingInset}px`,
            xPercent: 0,
            fontSize: headingEnd,
            ease: "none",
            duration: 0.75,
          },
          0
        );
        // Image dissolves out over the back half of the shrink so it never
        // reads as a cropped sliver -- just fully gone by the time the
        // heading lands. The heading's own color crossfades cream -> ink
        // on the same window so it's always legible against whatever is
        // behind it (dark image, then the cream page background).
        tl.to(imageRef.current, { opacity: 0, ease: "none", duration: 0.35 }, 0.4);
        tl.to(headingRef.current, { color: INK, ease: "none", duration: 0.35 }, 0.4);

        // 75%-100%: hold the settled state so it registers before the pin
        // releases into the grid below.
      }, outerRef);

      return () => ctx.revert();
    },
    [isDesktop],
    enhanced
  );

  if (reduceMotion) {
    return (
      <section className="w-full" style={{ backgroundColor: CREAM }}>
        <div className="mx-auto w-full max-w-[1100px] px-6 pt-16 md:px-16 md:pt-24">
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

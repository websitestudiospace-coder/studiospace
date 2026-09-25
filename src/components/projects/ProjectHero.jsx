"use client";

import { useEffect, useRef, useState } from "react";
import { CldImage } from "next-cloudinary";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectDescriptionModal from "./ProjectDescriptionModal";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const INK = "#2B2622";

// Total pinned scroll distance -- 100vh of that is the natural viewport, the
// remaining 40vh is the runway the shrink/reposition/reveal scrubs across
// (the timeline itself completes at 85%, leaving a ~15% settle buffer).
const SECTION_HEIGHT_VH = 140;

// Image box keyframes, as a percentage of the sticky h-screen container.
// `left` never animates -- staying pinned at 0 while `width`/`height` shrink
// is what reads as "moves to the left side" without a separate position
// tween. Desktop settles into a left column; mobile settles into a shorter
// top band (a 46%-wide column would be too narrow to hold a home's worth of
// stats/copy on a phone).
// GSAP only inherits a tween's unit from the property's *current* value when
// none is given -- passing bare numbers here defaults to pixels (CSS's own
// default for width/height/top), not percent, collapsing the box to a
// literal 46px-ish square instead of 46% of the viewport. Every value here
// must carry its own "%" string.
const IMAGE_END_DESKTOP = { width: "46%", height: "76%", top: "12%" };
const IMAGE_END_MOBILE = { width: "100%", height: "42%", top: "0%" };

// Name heading keyframes -- same "tween top/left/xPercent/yPercent/fontSize
// directly" technique as ProjectsHero's own shrinking heading, since GSAP
// can't animate a CSS clamp() formula. Desktop ends bottom-left, sitting on
// the now-B&W image; mobile stays horizontally centered (that image band is
// full-width) and just rises/shrinks.
const NAME_START_FONT_DESKTOP_CAP = 88;
const NAME_START_FONT_MOBILE_CAP = 40;
const NAME_END_FONT_DESKTOP = 28;
const NAME_END_FONT_MOBILE = 22;

// Project names vary a lot in length ("The Neo Colonial Home" vs. "The
// Modern Neo Classical Home"), and the starting state centers the name at
// full width with no wrap -- a fixed font size that fits the short names
// would overflow/clip the long ones. Fitting the size to the actual name
// (capped at the authored max) keeps every project's hero legible instead
// of tuning a separate constant per project. 0.56 is Agatho's rough average
// glyph-width-to-font-size ratio for uppercase Latin text -- approximate on
// purpose, since this only needs to avoid overflow, not hit an exact width.
const AGATHO_AVG_CHAR_WIDTH_RATIO = 0.56;

function fitNameFontSize(name, maxWidth, cap) {
  const fitted = maxWidth / (name.length * AGATHO_AVG_CHAR_WIDTH_RATIO);
  return Math.min(cap, fitted);
}

function StatBlock({ label, value }) {
  return (
    <div>
      <p
        className="text-xs uppercase tracking-[0.15em]"
        style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.65 }}
      >
        {label}
      </p>
      <p
        className="mt-1 text-base md:text-lg"
        style={{ fontFamily: "var(--font-manrope)", color: INK }}
      >
        {value}
      </p>
    </div>
  );
}

function DetailsPanelContent({ project, onReadMore }) {
  return (
    <div className="flex h-full w-full flex-col justify-center px-6 py-8 md:px-8 lg:px-12">
      <p
        className="text-sm md:text-base"
        style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.75 }}
      >
        {project.description}
      </p>

      <button
        type="button"
        onClick={onReadMore}
        className="hit-area mt-4 inline-block w-max uppercase tracking-[0.15em] text-xs md:text-sm border-b pb-1"
        style={{ fontFamily: "var(--font-manrope)", color: INK, borderColor: INK }}
      >
        Read More
      </button>

      <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 md:mt-12">
        <StatBlock label="Typology" value={project.typology} />
        <StatBlock label="Location" value={project.location} />
        <StatBlock label="Square Footage" value={project.squareFootage} />
        <StatBlock label="Completion" value={project.completion} />
      </div>
    </div>
  );
}

export default function ProjectHero({ project }) {
  const outerRef = useRef(null);
  const imageBoxRef = useRef(null);
  const imageFilterRef = useRef(null);
  const nameRef = useRef(null);
  const detailsRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  const enhanced = !reduceMotion;

  usePreloaderGate(
    () => {
      const imageEnd = isDesktop ? IMAGE_END_DESKTOP : IMAGE_END_MOBILE;
      const nameStartFont = fitNameFontSize(
        project.name,
        window.innerWidth * (isDesktop ? 0.82 : 0.86),
        isDesktop ? NAME_START_FONT_DESKTOP_CAP : NAME_START_FONT_MOBILE_CAP
      );
      const nameEndFont = isDesktop ? NAME_END_FONT_DESKTOP : NAME_END_FONT_MOBILE;

      const ctx = gsap.context(() => {
        gsap.set(imageBoxRef.current, { top: "0%", left: "0%", width: "100%", height: "100%" });
        gsap.set(imageFilterRef.current, { filter: "grayscale(0%)" });
        gsap.set(nameRef.current, {
          top: "50%",
          left: "50%",
          xPercent: -50,
          yPercent: -50,
          fontSize: nameStartFont,
        });
        gsap.set(detailsRef.current, {
          opacity: 0,
          x: isDesktop ? 24 : 0,
          y: isDesktop ? 0 : 24,
        });

        // ONE ScrollTrigger, ONE timeline, on the section's own pinned root
        // -- the image box, its grayscale filter, the name, and the details
        // panel never get their own independent triggers (the same golden
        // rule as About/Projects/AboutHero).
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: outerRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        });

        // Anchor the timeline to 1 "unit" so every position argument below
        // reads as a literal fraction of the pinned scroll range.
        tl.to({}, { duration: 1 }, 0);

        // 0%-70%: image shrinks + repositions to its settled box while
        // converting to grayscale, name rides along to its settled spot on
        // top of it.
        tl.to(imageBoxRef.current, { ...imageEnd, ease: "none", duration: 0.7 }, 0);
        tl.to(
          imageFilterRef.current,
          { filter: "grayscale(100%)", ease: "none", duration: 0.7 },
          0
        );
        tl.to(
          nameRef.current,
          isDesktop
            ? { top: "84%", left: "6%", xPercent: 0, yPercent: 0, fontSize: nameEndFont, ease: "none", duration: 0.7 }
            : { top: "34%", fontSize: nameEndFont, ease: "none", duration: 0.7 },
          0
        );

        // 55%-85%: details panel reveals on the side the image just
        // vacated, once the shrink is mostly settled.
        tl.to(
          detailsRef.current,
          { opacity: 1, x: 0, y: 0, ease: "none", duration: 0.3 },
          0.55
        );

        // 85%-100%: hold the settled state before the pin releases.
      }, outerRef);

      return () => ctx.revert();
    },
    [isDesktop, project.name],
    enhanced
  );

  if (reduceMotion) {
    return (
      <>
        <section
          className="flex w-full flex-col md:flex-row"
          style={{ backgroundColor: CREAM }}
        >
          <div className="relative h-[50vh] w-full overflow-hidden md:h-[85vh] md:w-[46%]">
            {project.cover ? (
              <CldImage
                src={project.cover}
                alt={project.name}
                fill
                priority
                sizes="(max-width: 767px) 100vw, 46vw"
                className="object-cover grayscale"
              />
            ) : (
              <div className="absolute inset-0" style={{ backgroundColor: INK }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <h1
              className="absolute bottom-6 left-6 uppercase text-white"
              style={{ fontFamily: "var(--font-agatho)", fontSize: "clamp(24px, 4vw, 32px)", lineHeight: 1.1 }}
            >
              {project.name}
            </h1>
          </div>
          <div className="w-full md:w-[54%]">
            <DetailsPanelContent project={project} onReadMore={() => setModalOpen(true)} />
          </div>
        </section>
        {modalOpen && (
          <ProjectDescriptionModal
            name={project.name}
            longDescription={project.longDescription}
            onClose={() => setModalOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <section ref={outerRef} className="relative w-full" style={{ height: `${SECTION_HEIGHT_VH}vh` }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ backgroundColor: CREAM }}>
          <div
            ref={imageBoxRef}
            className="absolute overflow-hidden"
            style={{ top: 0, left: 0, width: "100%", height: "100%" }}
          >
            <div ref={imageFilterRef} className="absolute inset-0">
              {project.cover ? (
                <CldImage
                  src={project.cover}
                  alt={project.name}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0" style={{ backgroundColor: INK }} />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/25" />
          </div>

          <h1
            ref={nameRef}
            className="pointer-events-none absolute whitespace-nowrap uppercase text-white"
            style={{
              fontFamily: "var(--font-agatho)",
              lineHeight: 1.1,
              textShadow: "0 1px 3px rgba(43,38,34,0.7), 0 2px 12px rgba(43,38,34,0.5)",
            }}
          >
            {project.name}
          </h1>

          <div
            ref={detailsRef}
            className="absolute"
            style={
              isDesktop
                ? { top: 0, right: 0, width: "54%", height: "100%" }
                : { top: "42%", left: 0, width: "100%", height: "58%" }
            }
          >
            <DetailsPanelContent project={project} onReadMore={() => setModalOpen(true)} />
          </div>
        </div>
      </section>
      {modalOpen && (
        <ProjectDescriptionModal
          name={project.name}
          longDescription={project.longDescription}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

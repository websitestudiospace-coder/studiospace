"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useReducedMotion from "@/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const INK = "#2B2622";

// Total pinned scroll distance -- 100vh is the natural viewport, the
// remaining 70vh is the runway the shrink+desaturate, text-reveal, and hold
// phases scrub across (see the timeline positions below). More generous
// than the old single-tween version's 30vh since this now carries three
// phases instead of one -- sized so the settled hold (see Phase 3's comment)
// reads as a real pause, not a flash, matching the fix already applied to
// Quote/About's own holds on the homepage.
const SECTION_HEIGHT_VH = 170;

// Settled width of the image once it's done shrinking -- also the text
// panel's own fixed left offset/width (see StudioCopy panel below), same
// dual-purpose role IMAGE_HOLD_WIDTH plays in home/About.jsx.
const SETTLED_IMAGE_WIDTH = 50;

// Slide distance used on the text panel's entrance -- same value and role
// as home/About.jsx's own TEXT_SLIDE_X.
const TEXT_SLIDE_X = 40;

// Mobile: the photo pins full-screen and shrinks 100vh -> 50vh (same
// pinned, scrubbed height tween as ProjectHero's mobile cover), over a
// runway equal to the height it loses -- see the mobile branch below for
// why the two must match.
const MOBILE_SETTLED_IMAGE_VH = 50;
const MOBILE_SHRINK_RUNWAY_VH = 100 - MOBILE_SETTLED_IMAGE_VH;

// Micro-label styling shared by both groups below -- same treatment the
// old single "Our Studio" label used.
const LABEL_CLASS = "text-xs uppercase tracking-[0.2em] md:text-sm";
const BODY_CLASS = "max-w-2xl text-sm md:text-base";
const COPY_STYLE = { fontFamily: "var(--font-manrope)", color: INK, opacity: 0.65 };

// Studio description copy, moved in from StudioDescription.jsx (now retired
// as its own section -- see about/page.js). Alignment adapted from that
// file's centered full-width block to a left-aligned side panel, since it
// now sits beside the image instead of on its own.
//
// Two labeled sub-sections, per the client's reference doc: "About Studio
// SP_ACE" (studio intro + no-signature-style paragraphs) and "Our Story"
// (the SP_ACE naming story). This was briefly one continuous block under a
// single "Our Studio" label (the naming-story paragraph got merged in
// without its own label) -- the client asked for the two-beat structure
// back, so it's split again here. OurStory.jsx itself stays deleted (see
// about/page.js); this is still the only place that copy lives.
function StudioCopy() {
  return (
    <>
      <p className={LABEL_CLASS} style={COPY_STYLE}>
        About Studio SP_ACE
      </p>
      <p className={`mt-6 ${BODY_CLASS}`} style={COPY_STYLE}>
        Studio SP_ACE is a Bangalore-based interior design studio founded by
        Shubham and Priyanka in 2022. Working across India, we design and
        execute homes that are personal, considered, and made around the
        people who live in them.
      </p>
      <p className={`mt-4 ${BODY_CLASS}`} style={COPY_STYLE}>
        We don&rsquo;t really believe in one signature style. Every project
        starts with the people, their stories, and the way they live — and
        takes shape from there.
      </p>

      <p className={`mt-8 ${LABEL_CLASS}`} style={COPY_STYLE}>
        Our Story
      </p>
      <p className={`mt-6 ${BODY_CLASS}`} style={COPY_STYLE}>
        The name SP_ACE started with the two of us — Shubham and Priyanka —
        and a little play on words. SP for us, and ACE for what we set out
        to do: ace what we love doing. What started in Bangalore in 2022
        has grown into a studio working across cities, with every project
        bringing a new story, a new perspective, and a new way of looking
        at design.
      </p>
    </>
  );
}

export default function AboutHero() {
  const outerRef = useRef(null);
  const imageRef = useRef(null);
  const textRef = useRef(null);
  const mobileImageRef = useRef(null);
  const mobileOuterRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Desktop-only, same rule as home/About.jsx: the pinned sequence relies on
  // an absolutely-positioned image/text split (image width tweened as a %,
  // text box pinned at a fixed left offset) that has no mobile-width
  // equivalent -- at narrow viewports the settled 50/50 split squeezes the
  // text panel into a column too narrow to read comfortably. Mobile always
  // falls through to the plain stacked "!enhanced" branch below instead.
  const enhanced = !reduceMotion && isDesktop;

  // This is the first section on the page, directly under the fixed Nav
  // with nothing above it in document flow, so this trigger's "top top"
  // measurement doesn't depend on any earlier section's mount-time layout
  // settling -- safe to build immediately instead of waiting for
  // "preloader:complete" (same reasoning as Hero/HeroQuoteTransition).
  useEffect(() => {
    if (!enhanced) return;

    const ctx = gsap.context(() => {
      gsap.set(imageRef.current, { width: "100%", filter: "grayscale(0%)" });
      gsap.set(textRef.current, { opacity: 0, x: TEXT_SLIDE_X });

      // ONE ScrollTrigger, ONE timeline, on the section's own pinned root --
      // the shrink, the desaturate, and the text reveal never get their own
      // independent triggers (the same golden rule as About/Projects/Quote).
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: outerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      // Anchor the timeline to 1 "unit" so every position argument below
      // reads as a literal fraction of the pinned scroll range -- including
      // the trailing hold, where nothing animates but the settled state
      // still needs scroll distance to sit still in.
      tl.to({}, { duration: 1 }, 0);

      // Phase 1 (0%-55%): image shrinks from full-bleed to its settled half
      // width while draining from full color to black & white (same
      // direction as the mobile branch and ProjectHero's cover photo), on
      // the same window -- both read as one continuous "the hero is settling
      // in" motion rather than two separate, sequential beats.
      tl.to(imageRef.current, { width: `${SETTLED_IMAGE_WIDTH}%`, ease: "none", duration: 0.55 }, 0);
      tl.to(imageRef.current, { filter: "grayscale(100%)", ease: "none", duration: 0.55 }, 0);

      // Phase 2 (45%-75%): the studio copy fades/slides in from the side
      // that's opening up as the image shrinks -- starts slightly before
      // Phase 1 finishes so the handoff reads as one continuous reveal
      // instead of a beat of dead air between "image done shrinking" and
      // "text starts appearing."
      tl.to(textRef.current, { opacity: 1, x: 0, ease: "none", duration: 0.3 }, 0.45);

      // Phase 3 (75%-100%): hold at the settled half-width/black-and-white/
      // text-visible state so it registers before the pin releases into
      // StudioDescription's old neighbor, MeetFounders -- same reasoning as
      // Quote's and home/About's own closing holds.
    }, outerRef);

    return () => ctx.revert();
  }, [enhanced]);

  // Mobile shrink: the photo box's height scrubs 100% -> 50% of its sticky
  // h-screen wrapper across the whole runway, linearly (ease "none", full
  // range), so its bottom edge moves at exactly scroll speed -- which is
  // what keeps the pulled-up copy below glued to it (see the mobile branch).
  // It drains from full color to black & white on the same scrub, the same
  // way the desktop branch above and ProjectHero's cover pair their shrink
  // with the grayscale filter. Reduced motion gets the static 50vh photo,
  // already in its settled black & white state.
  const mobileShrink = !reduceMotion && !isDesktop;

  useEffect(() => {
    if (!mobileShrink) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        mobileImageRef.current,
        { height: "100%", filter: "grayscale(0%)" },
        {
          height: `${MOBILE_SETTLED_IMAGE_VH}%`,
          filter: "grayscale(100%)",
          ease: "none",
          scrollTrigger: {
            trigger: mobileOuterRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        }
      );
    }, mobileOuterRef);

    return () => ctx.revert();
  }, [mobileShrink]);

  // Mobile (below md), with or without reduced motion. Photo turns black &
  // white as it shrinks (see above), cropped at 35% horizontally (15% left
  // of center) -- client request, after trying left/right/center/40%.
  //
  // Shrink layout: the section is 100vh + a runway equal to the height the
  // photo loses (50vh), with the photo pinned in a sticky h-screen wrapper.
  // The copy that follows is pulled up by that same runway, so at scroll s
  // its top sits at 100vh - s -- exactly where the shrinking photo's bottom
  // edge is (100vh - s, until it settles at 50vh when the pin releases).
  // The two move together, with no empty band opening up between them.
  if (!isDesktop) {
    return (
      <>
        <section
          ref={mobileOuterRef}
          className="relative w-full"
          style={{
            height: mobileShrink ? `${100 + MOBILE_SHRINK_RUNWAY_VH}vh` : undefined,
            backgroundColor: CREAM,
          }}
        >
          <h1 className="sr-only">About Studio SP_ACE</h1>
          {/* z-[1] keeps the photo above the pulled-up copy wherever
              sub-pixel rounding lets them touch; pointer-events-none since
              the wrapper's empty lower half sits over that copy mid-pin. */}
          <div className={mobileShrink ? "pointer-events-none sticky top-0 z-[1] h-screen w-full" : "w-full"}>
            {/* Height via classes, never an inline style: reduceMotion
                resolves after the first render, so the shrink tween can
                start and then be reverted, and ctx.revert() restores the
                inline style GSAP first saw -- an inline "100%" would come
                back over the static branch and collapse the box to 0. With
                no inline height, revert leaves the class in charge.
                h-[50vh] matches MOBILE_SETTLED_IMAGE_VH (Tailwind needs it
                written out literally). */}
            <div
              ref={mobileImageRef}
              className={`relative w-full overflow-hidden ${mobileShrink ? "h-full" : "h-[50vh]"}`}
            >
              <Image
                src="/images/about/about-cover.webp"
                alt="Priyanka and Shubham, co-founders of Studio SP_ACE"
                fill
                priority
                sizes="100vw"
                className={`object-cover object-[35%_50%] ${mobileShrink ? "" : "grayscale"}`}
              />
              {/* Same top-anchored band as the desktop branch, so the
                  transparent Nav's cream logo/links stay legible over the
                  photo's light sky. */}
              <div className="absolute left-0 top-0 h-[250px] w-full bg-gradient-to-b from-black/50 via-black/20 to-transparent" />
            </div>
          </div>
        </section>
        <div
          className="relative w-full px-6 pb-16 pt-8"
          style={{
            backgroundColor: CREAM,
            marginTop: mobileShrink ? `-${MOBILE_SHRINK_RUNWAY_VH}vh` : undefined,
          }}
        >
          <StudioCopy />
        </div>
      </>
    );
  }

  if (!enhanced) {
    // Reduced-motion fallback -- in practice only reached at md and up now
    // (mobile has its own branch above); the below-md classes are what it
    // used to share with mobile. Stacks image-over-text (full width) below
    // md, sits side by side at md and up (same pattern as home/About.jsx's
    // own fallback).
    // Below md the photo is a full-bleed hero starting at y=0 behind the
    // transparent Nav (no top padding, no side padding -- the text column
    // carries its own px-6 instead), same treatment as the desktop branch
    // and project pages. md+ (reduced-motion desktop) keeps its padded
    // side-by-side layout unchanged.
    return (
      <section
        className="flex w-full flex-col items-center gap-8 pb-16 md:flex-row md:gap-12 md:px-8 md:py-24 lg:px-16"
        style={{ backgroundColor: CREAM }}
      >
        <h1 className="sr-only">About Studio SP_ACE</h1>
        <div ref={mobileImageRef} className="relative h-[50vh] w-full overflow-hidden md:h-[70vh] md:w-1/2">
          <Image
            src="/images/about/about-cover.webp"
            alt="Priyanka and Shubham, co-founders of Studio SP_ACE"
            fill
            priority
            sizes="(max-width: 767px) 100vw, 50vw"
            className="object-cover"
          />
          {/* Same top-anchored band as the desktop branch below, so the
              transparent Nav's cream logo/links stay legible over the
              photo's light sky. Mobile only -- at md+ this branch's photo
              sits in padded flow, not under the Nav. */}
          <div className="absolute left-0 top-0 h-[250px] w-full bg-gradient-to-b from-black/50 via-black/20 to-transparent md:hidden" />
        </div>
        <div className="w-full px-6 md:w-1/2 md:px-0">
          <StudioCopy />
        </div>
      </section>
    );
  }

  return (
    <section
      ref={outerRef}
      className="relative w-full"
      style={{ height: `${SECTION_HEIGHT_VH}vh`, backgroundColor: CREAM }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <h1 className="sr-only">About Studio SP_ACE</h1>

        <div ref={imageRef} className="absolute left-0 top-0 h-full overflow-hidden" style={{ width: "100%" }}>
          <Image
            src="/images/about/about-cover.webp"
            alt="Priyanka and Shubham, co-founders of Studio SP_ACE"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {/* Nav sits transparent (cream text) over this hero for its first
            ~80px of scroll (see about/page.js's <Nav /> usage) -- the
            photo's own top strip is a light wall/sky (measured ~228/255
            luminance), which read at ~1.2:1 contrast against cream text,
            nowhere near legible. Same fix Home's own Hero.jsx already uses
            for the identical problem, reused verbatim rather than inventing
            a new one: a top-anchored dark-to-transparent band, independent
            of imageRef's own shrinking width so it stays full-bleed for as
            long as the transparent-nav window actually lasts. */}
        <div className="absolute left-0 top-0 h-[250px] w-full bg-gradient-to-b from-black/50 via-black/20 to-transparent" />

        {/* Box stays fixed at the settled-layout position for the whole
            timeline -- only opacity/x (the entrance slide) animate. */}
        <div
          ref={textRef}
          className="absolute top-0 flex h-full flex-col justify-center px-8 md:px-12 lg:px-16"
          style={{ left: `${SETTLED_IMAGE_WIDTH}%`, width: `${100 - SETTLED_IMAGE_WIDTH}%` }}
        >
          <StudioCopy />
        </div>
      </div>
    </section>
  );
}

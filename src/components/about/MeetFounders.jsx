"use client";

import { useRef } from "react";
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
const MAROON = "#6E1F24";

// Sticky offset for the right-hand content column below (heading/tagline/
// founder blocks) -- Nav's own bar is ~104px tall at the md breakpoint
// (logo md:h-[72px] + py-4/16px top+bottom -- see Nav.jsx), fixed/position:
// fixed and always on top (z-[100]), so a plain `top-0` sticky would tuck
// the column's top edge flush underneath it. The extra ~24px beyond that is
// just breathing room, not a hard requirement.
const STICKY_COLUMN_TOP_PX = 128;

// portrait 1.jpg's actual pixel dimensions -- feeds next/image's own
// width/height (not `fill` inside a forced aspect-ratio box) so the whole
// photo lays out at its real, uncropped ratio. h-auto/w-full below then
// just scales that intrinsic box responsively; nothing ever crops it.
// Source was originally a 5331x7948 (42MP) unresized export -- absurdly
// oversized for a photo that only ever renders at up to 40vw; downscaled
// to 2400x3578 (same aspect ratio, still well above any real render size)
// during the pre-launch audit's image-compression pass.
const PHOTO_WIDTH = 2400;
const PHOTO_HEIGHT = 3578;

// Confirmed via the studio's own Instagram bio ("Founders & Principal
// Designers — @shubham.shingate_07 @priyanka_khandekar"), not invented --
// the bio doesn't differentiate a title per founder, so both columns share
// the same singular-subject phrasing.
const TITLE = "Founder & Principal Designer";

// The client provided one joint note instead of two individual bios -- see
// FOUNDERS_NOTE below, rendered once beneath both founders' name/title
// blocks rather than duplicated per founder.
const FOUNDERS = [{ name: "Shubham" }, { name: "Priyanka" }];

const FOUNDERS_NOTE = [
  "For us, the best part of design is seeing an idea travel from a thought in our heads to something that actually exists. From the first sketch to the final detail on site, we love being part of that entire journey — especially figuring out how to make an idea work in the real world.",
  "We naturally bring different things to the table. Shubham is drawn to the technical side — how something will be made, detailed, and executed — while Priyanka gravitates towards the design side, from colours and materials to the overall feeling of a space. Somewhere between the two is where a lot of our favourite ideas come together.",
  "A space, to us, should tell you something about the people and purpose behind it. Their stories, experiences, interests, and the way they want a space to feel should find their way into the design, alongside a little of our own design language. We love that every project can have its own character.",
  "Travelling and observing are a big part of how we find inspiration. Spaces, buildings, materials, streets, and even small details stay with us, often finding their way into a project when we least expect them.",
  "As SP_ACE grows, we hope to take on bigger ideas, more places, and more ambitious projects — without losing what matters to us: creating spaces that feel personal, thoughtful, and true to the people and purpose behind them.",
];

function FounderColumn({ founder, colRef, reduceMotion }) {
  return (
    <div ref={colRef} style={reduceMotion ? undefined : { opacity: 0 }}>
      <h3
        className="text-2xl md:text-3xl"
        style={{ fontFamily: "var(--font-agatho)", color: MAROON }}
      >
        {founder.name}
      </h3>
      <p
        className="mt-3 text-xs uppercase tracking-[0.2em]"
        style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.55 }}
      >
        {TITLE}
      </p>
    </div>
  );
}

export default function MeetFounders() {
  const sectionRef = useRef(null);
  const peopleHeadingWrapRef = useRef(null);
  const peopleHeadingTextRef = useRef(null);
  const peopleHeadingLeftLineRef = useRef(null);
  const peopleHeadingRightLineRef = useRef(null);
  const contentRef = useRef(null);
  const photoRef = useRef(null);
  const headingRef = useRef(null);
  const founderRefs = useRef([]);
  const noteRef = useRef(null);
  const reduceMotion = useReducedMotion();

  // "The People Behind SP ACE" -- a small transitional heading between
  // AboutHero above and the founders content below, replacing the old
  // hand-drawn "FOUNDERS" wordmark. Scroll-scrubbed (not one-shot): the
  // client asked for the zoom to happen gradually as they scroll, not play
  // out on a fixed timer the instant it enters view -- so this timeline is
  // driven directly by scroll position (scrub: true) across the trigger's
  // start/end window instead of toggleActions. The heading zooms in first,
  // then the two flanking lines scale in from the text outward
  // (transform-origin set toward the text on each side, see the JSX below)
  // once the zoom has mostly landed.
  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        gsap.set(peopleHeadingTextRef.current, { opacity: 0, scale: 0.65 });
        gsap.set([peopleHeadingLeftLineRef.current, peopleHeadingRightLineRef.current], {
          scaleX: 0,
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: peopleHeadingWrapRef.current,
            start: "top 90%",
            end: "top 30%",
            scrub: 0.6,
          },
        });

        tl.to(peopleHeadingTextRef.current, { opacity: 1, scale: 1, duration: 0.8, ease: "none" }, 0);
        tl.to(
          [peopleHeadingLeftLineRef.current, peopleHeadingRightLineRef.current],
          { scaleX: 1, duration: 0.5, ease: "none" },
          0.45
        );
      }, peopleHeadingWrapRef);

      return () => ctx.revert();
    },
    [],
    !reduceMotion
  );

  // One-shot reveal (not scroll-scrubbed) -- same Phase 3 pattern as every
  // other section on this page: the photo, then the heading block, then the
  // two founder columns, all staggered on ONE timeline against ONE
  // ScrollTrigger (never a second trigger layered on top). The "People
  // Behind SP_ACE" heading above is deliberately NOT in this timeline --
  // its own reveal (above) is a fully separate, independent trigger, so the
  // two never fight over the same element. Triggers against contentRef (the
  // photo/heading/founders grid), NOT sectionRef -- sectionRef now also
  // contains that heading block ahead of this content, so "top 80%"
  // measured against sectionRef's own top would fire (and fully resolve,
  // since this isn't scrubbed) long before the user has scrolled anywhere
  // near this content, defeating the point of a scroll-triggered reveal.
  // contentRef sits immediately above this grid, so "top 80%"
  // stays meaningful regardless of how tall the pin above it is. Still
  // waits for "preloader:complete" since that "top 80%" position depends on
  // AboutHero above it already being in its final, settled layout --
  // creating the trigger any earlier bakes in a stale measurement that a
  // later resize/refresh won't reliably correct, which is what actually
  // breaks a reveal like this (the trigger exists and the tween is valid,
  // it just never satisfies "top 80%" against real scroll position because
  // the number it was given at creation time was already wrong).
  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        const founders = founderRefs.current.filter(Boolean);
        const targets = [photoRef.current, headingRef.current, ...founders, noteRef.current];

        // Every target gets its start state set in the SAME gsap.set() call
        // that's about to be immediately followed by the tween below --
        // never split across renders or re-runs, so there's no window where
        // something is left at opacity:0 with no animation actually queued
        // to bring it back.
        gsap.set(targets, { opacity: 0, y: 24 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });

        tl.to(
          [photoRef.current, headingRef.current],
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
          0
        );
        tl.to(
          founders,
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.15 },
          0.25
        );
        tl.to(noteRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.4);
      }, contentRef);

      return () => ctx.revert();
    },
    [],
    !reduceMotion
  );

  return (
    <section ref={sectionRef} className="relative w-full" style={{ backgroundColor: CREAM }}>
      <h1 className="sr-only">Meet the Founders of Studio SP_ACE</h1>

      {/* "The People Behind SP_ACE" -- small transitional heading, text
          first then a thin line grows in from each side (see the hook
          above). reduceMotion: rendered already in its settled state (full
          opacity, full-width lines), no animation. */}
      <div
        ref={peopleHeadingWrapRef}
        className="flex min-h-[50vh] w-full items-center justify-center gap-6 px-6 md:min-h-[58vh]"
      >
        <div
          ref={peopleHeadingLeftLineRef}
          aria-hidden="true"
          className="hidden h-px flex-1 sm:block"
          style={{
            backgroundColor: INK,
            opacity: 0.3,
            transformOrigin: "right",
            ...(reduceMotion ? undefined : { transform: "scaleX(0)" }),
          }}
        />
        <h2
          ref={peopleHeadingTextRef}
          className="whitespace-nowrap text-4xl md:text-6xl lg:text-7xl"
          style={{
            fontFamily: "var(--font-agatho)",
            color: INK,
            transformOrigin: "center",
            ...(reduceMotion ? undefined : { opacity: 0 }),
          }}
        >
          The People Behind SP ACE
        </h2>
        <div
          ref={peopleHeadingRightLineRef}
          aria-hidden="true"
          className="hidden h-px flex-1 sm:block"
          style={{
            backgroundColor: INK,
            opacity: 0.3,
            transformOrigin: "left",
            ...(reduceMotion ? undefined : { transform: "scaleX(0)" }),
          }}
        />
      </div>

      {/* Photo (left, bleeds to the true left edge, ~40% of the row) +
          right column (~60%, normal page padding) carrying the heading,
          tagline, AND both founder blocks -- everything to the right of the
          photo lives in this one column now, not split into a separate row
          further down the page. Breaks out of the site's usual
          max-w-[1100px]/px-6/px-16 container on purpose, same as before:
          that's what lets the photo start flush against the viewport edge
          instead of sitting inset like every other section's imagery.
          items-start (not items-center) since the right column now carries
          far more content than the photo alone and would otherwise get
          vertically centered against it in a way that no longer reads
          intentionally once it's this much taller. pb-16/md:pb-24 (the
          section's old bottom padding, moved here now that the section
          itself carries no padding of its own -- see the wordmark block
          above for why) keeps the same breathing room before WhatWeBelieve
          below. */}
      <div
        ref={contentRef}
        className="mt-10 grid grid-cols-1 pb-16 md:mt-14 md:grid-cols-[2fr_3fr] md:items-start md:pb-24"
      >
        <div ref={photoRef} className="w-full" style={reduceMotion ? undefined : { opacity: 0 }}>
          <Image
            src="/images/about/portrait 1.jpg"
            alt="Priyanka and Shubham, co-founders of Studio SP_ACE"
            width={PHOTO_WIDTH}
            height={PHOTO_HEIGHT}
            sizes="(max-width: 768px) 100vw, 40vw"
            className="h-auto w-full rounded-[8px]"
          />
        </div>

        {/* Outer grid item -- md:self-stretch (overriding just this column's
            alignment; the grid container itself keeps md:items-start
            unchanged, so photoRef above is completely untouched and stays
            top-aligned/naturally-sized exactly as before) makes THIS
            column's own box stretch to the row's full height (still
            computed as max(photo's natural height, this column's own inner
            content height) -- align-self only changes how a item fills an
            already-sized row, it doesn't change the row-sizing calculation
            itself). That stretched height is what gives the inner sticky
            div below room to actually stick within -- without it, this
            outer box would shrink-to-fit its own content (the old
            items-start behavior) and the sticky child would have zero
            extra space to move through before immediately un-sticking. */}
        <div ref={headingRef} className="md:self-stretch" style={reduceMotion ? undefined : { opacity: 0 }}>
          {/* The actual sticky element -- md:sticky (mobile stays static:
              at the single-column breakpoint the photo and this column
              stack in separate rows, so there's no taller sibling to scroll
              past and sticky would have nothing meaningful to do). top
              offset clears the fixed Nav bar (see STICKY_COLUMN_TOP_PX)
              plus a little breathing room, so the column doesn't end up
              pinned flush underneath it. */}
          <div
            className="px-6 py-10 md:sticky md:px-16 md:py-0"
            style={{ top: `${STICKY_COLUMN_TOP_PX}px` }}
          >
            <h2
              className="text-[32px] md:text-[48px]"
              style={{ fontFamily: "var(--font-agatho)", color: INK }}
            >
              Meet The Founders
            </h2>
            {/* TODO: placeholder tagline -- swap in the client's confirmed
                copy once provided. */}
            <p
              className="mt-4 max-w-2xl text-sm md:text-base"
              style={{ fontFamily: "var(--font-manrope)", color: MAROON }}
            >
              Two designers, one shared vision for how spaces should feel.
            </p>

            {/* Founder blocks -- name and role only now (the client
                provided one shared note instead of two individual bios, see
                FOUNDERS_NOTE/noteRef below, and asked for the per-founder
                Instagram/LinkedIn buttons removed), so side-by-side reads
                comfortably at this column's width instead of the stacked
                layout the old, much longer per-founder bios needed. */}
            <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:gap-14">
              {FOUNDERS.map((founder, i) => (
                <FounderColumn
                  key={founder.name}
                  founder={founder}
                  reduceMotion={reduceMotion}
                  colRef={(el) => {
                    founderRefs.current[i] = el;
                  }}
                />
              ))}
            </div>

            {/* Founders' Note -- the one shared block the client provided in
                place of two separate bios, sitting beneath both founders
                rather than forced into either individual slot. */}
            <div
              ref={noteRef}
              className="mt-10"
              style={reduceMotion ? undefined : { opacity: 0 }}
            >
              <h3
                className="text-xl md:text-2xl"
                style={{ fontFamily: "var(--font-agatho)", color: INK }}
              >
                Founders&rsquo; Note
              </h3>
              <div className="mt-4 space-y-4">
                {FOUNDERS_NOTE.map((p, i) => (
                  <p
                    key={i}
                    className="max-w-2xl text-sm md:text-base"
                    style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.7 }}
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

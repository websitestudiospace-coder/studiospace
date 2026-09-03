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
const MAROON = "#6E1F24";

// The wordmark's low-opacity muted tone -- was previously just the plain
// `<span>`'s CSS opacity; now reused as-is for both the SVG text's stroke
// and its fill so the settled end state reads identically to the original
// fade-in version, just arrived at via a stroke-draw instead of a fade.
const WORDMARK_OPACITY = 0.12;

// portrait 1.jpg's actual pixel dimensions -- feeds next/image's own
// width/height (not `fill` inside a forced aspect-ratio box) so the whole
// photo lays out at its real, uncropped ratio. h-auto/w-full below then
// just scales that intrinsic box responsively; nothing ever crops it.
const PHOTO_WIDTH = 5331;
const PHOTO_HEIGHT = 7948;

// Confirmed via the studio's own Instagram bio ("Founders & Principal
// Designers — @shubham.shingate_07 @priyanka_khandekar"), not invented --
// the bio doesn't differentiate a title per founder, so both columns share
// the same singular-subject phrasing.
const TITLE = "Founder & Principal Designer";

const INSTAGRAM_URL = "https://instagram.com/studio_sp_ace";
// TODO: placeholder -- swap in each founder's real LinkedIn profile URL once
// provided by the client.
const LINKEDIN_URL = "#";

// TODO: placeholder copy -- swap in the client's real founder bios once
// provided.
const FOUNDERS = [
  {
    name: "Shubham",
    paragraphs: [
      "Shubham's background and design philosophy write-up is on its way from the client.",
      "More on his specific focus areas and role at the studio will follow once confirmed.",
    ],
  },
  {
    name: "Priyanka",
    paragraphs: [
      "Priyanka's background and design philosophy write-up is on its way from the client.",
      "More on her specific focus areas and role at the studio will follow once confirmed.",
    ],
  },
];

function ArrowIcon() {
  return (
    <svg width="22" height="14" viewBox="0 0 22 14" fill="none" aria-hidden="true" className="shrink-0">
      <path
        d="M0.5 7H20.5M20.5 7L14.5 1M20.5 7L14.5 13"
        stroke={MAROON}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Decorative outline that overlaps the top-left corner of the heading, like
// a hand-drawn circle marking out part of the phrase -- stroke only, no
// fill, so it never obscures the text it crosses over.
function OvalOutline() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute -top-5 -left-5 md:-top-6 md:-left-6"
      width="96"
      height="56"
      viewBox="0 0 96 56"
      fill="none"
    >
      <ellipse cx="48" cy="28" rx="46" ry="25" stroke={MAROON} strokeWidth="1.5" />
    </svg>
  );
}

function PillLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center rounded-full px-5 py-2 text-xs uppercase tracking-[0.15em] transition-colors duration-200 ease-out hover:bg-[rgba(110,31,36,0.06)]"
      style={{ border: `1px solid ${MAROON}`, color: INK, fontFamily: "var(--font-manrope)" }}
    >
      {children}
    </a>
  );
}

function FounderColumn({ founder, colRef, reduceMotion }) {
  return (
    <div ref={colRef} style={reduceMotion ? undefined : { opacity: 0 }}>
      <div className="flex items-center gap-3">
        <ArrowIcon />
        <h3
          className="text-2xl md:text-3xl"
          style={{ fontFamily: "var(--font-agatho)", color: MAROON }}
        >
          {founder.name}
        </h3>
      </div>
      <p
        className="mt-3 text-xs uppercase tracking-[0.2em]"
        style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.55 }}
      >
        {TITLE}
      </p>
      <div className="mt-5 space-y-4">
        {founder.paragraphs.map((p, i) => (
          <p
            key={i}
            className="max-w-2xl text-sm md:text-base"
            style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.7 }}
          >
            {p}
          </p>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <PillLink href={INSTAGRAM_URL}>Instagram</PillLink>
        <PillLink href={LINKEDIN_URL}>LinkedIn</PillLink>
      </div>
    </div>
  );
}

export default function MeetFounders() {
  const sectionRef = useRef(null);
  const wordmarkWrapRef = useRef(null);
  const wordmarkTextRef = useRef(null);
  const photoRef = useRef(null);
  const headingRef = useRef(null);
  const founderRefs = useRef([]);
  const reduceMotion = useReducedMotion();

  // Real, JS-measured pixel dimensions for the wordmark's SVG, rather than
  // CSS `width:100%`/`height:1em` with no viewBox -- that approach relies on
  // the SVG correctly inheriting the wrapper's clamp()-based font-size
  // across the HTML/SVG boundary via CSS em resolution, which is a known
  // cross-browser-fragile pattern (an SVG with no viewBox and no explicit
  // width/height attribute falls back to a default 300x150 intrinsic box if
  // that inheritance doesn't resolve the way a given engine/zoom level
  // expects, silently rendering nothing visible). Measuring the wrapper's
  // own real rendered box via ResizeObserver and feeding those exact
  // numbers into both the SVG's width/height AND a matching viewBox removes
  // that ambiguity entirely -- the SVG's coordinate system is always
  // provably 1:1 with real, already-resolved pixels.
  const [wordmarkBox, setWordmarkBox] = useState(null);

  useEffect(() => {
    const el = wordmarkWrapRef.current;
    if (!el) return undefined;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const fontSize = parseFloat(getComputedStyle(el).fontSize) || 0;
      if (rect.width > 0 && rect.height > 0) {
        setWordmarkBox({ width: rect.width, height: rect.height, fontSize });
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // One-shot reveal (not scroll-scrubbed) -- same Phase 3 pattern as every
  // other section on this page: the photo, then the heading block, then the
  // two founder columns, all staggered on ONE timeline against ONE
  // ScrollTrigger (never a second trigger layered on top). The wordmark is
  // deliberately NOT in this timeline -- its own stroke-draw effect (below)
  // is a fully separate, independent trigger, so the two never fight over
  // the same element. Still waits for "preloader:complete" since "top 80%"
  // is measured against this section's own position, which depends on
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
        const targets = [photoRef.current, headingRef.current, ...founders];

        // Every target gets its start state set in the SAME gsap.set() call
        // that's about to be immediately followed by the tween below --
        // never split across renders or re-runs, so there's no window where
        // something is left at opacity:0 with no animation actually queued
        // to bring it back.
        gsap.set(targets, { opacity: 0, y: 24 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
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
      }, sectionRef);

      return () => ctx.revert();
    },
    [],
    !reduceMotion
  );

  // Independent, self-contained trigger for the wordmark's stroke-draw --
  // its own usePreloaderGate call, its own gsap.context, its own
  // ScrollTrigger, entirely separate from the content timeline above so
  // neither can double-animate or race the other on the same element (the
  // wordmark is untouched by the timeline above; this is the only thing
  // that ever animates it). Scroll-scrubbed (scrub: true, ease: "none"),
  // matching the project-wide standard for scroll-tied elements -- draw
  // progress tracks scroll position directly and bidirectionally, so
  // scrolling back up naturally undraws it, with no extra logic needed for
  // that (scrub tweens are just a function of scroll position). wordmarkRef
  // is a plain, direct target of its own trigger -- no ancestor of it is
  // independently transformed by anything else in this component (the
  // content timeline above only ever touches photoRef/headingRef/
  // founderRefs), matching the golden rule every other scroll-scrubbed
  // element on this site follows.
  usePreloaderGate(
    () => {
      const textEl = wordmarkTextRef.current;
      // The <text> element only exists once wordmarkBox has been measured
      // (see the ResizeObserver effect above) -- this dependency array
      // includes wordmarkBox specifically so that if this effect's first
      // run ever lands before that measurement resolves (e.g. preloader
      // already done at mount, racing the ResizeObserver's first callback),
      // it re-runs again once wordmarkBox actually becomes non-null instead
      // of silently no-op'ing forever with no retry.
      if (!textEl) return undefined;

      const ctx = gsap.context(() => {
        // <text> has no getTotalLength() (that's path-only) -- there's no
        // exact way to measure a glyph outline's true perimeter for
        // stroke-dasharray. getComputedTextLength() gives the rendered
        // ADVANCE width instead (reflecting whatever the clamp()-based
        // font-size actually resolved to); multiplying it down (not up --
        // measured directly against this render: an inflated estimate left
        // most of the scroll range "dead," since text-outline dash budgets
        // are consumed almost entirely within roughly the last third of
        // the offset range) gives a dash length that empirically completes
        // right as the outline visually finishes, so the scrub range isn't
        // mostly spent on a stroke that already looks fully drawn.
        const advanceWidth = textEl.getComputedTextLength();
        const estimatedLength = Math.max(advanceWidth * 0.65, 100);

        gsap.set(textEl, {
          strokeDasharray: estimatedLength,
          strokeDashoffset: estimatedLength,
          strokeOpacity: WORDMARK_OPACITY,
          fillOpacity: 0,
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            // The wordmark sits right at the section's own top edge, so as
            // the section scrolls up from below the fold, the wordmark is
            // among the very first things to appear -- a trigger range that
            // starts once the section is already meaningfully in view (e.g.
            // "top 85%") means the draw is mostly/fully done before the
            // wordmark is even fully on screen. Starting at "top 100%"
            // (the instant the section's top touches the viewport's own
            // bottom edge, before anything is visible yet) and ending much
            // later at "top 20%" spreads the draw across the wordmark's
            // entire entrance instead of front-loading it.
            start: "top 100%",
            end: "top 20%",
            scrub: true,
          },
        });

        // Phase 1: the hand-drawn outline traces in as the section arrives.
        tl.to(textEl, { strokeDashoffset: 0, ease: "none", duration: 0.7 }, 0);
        // Phase 2: the letterforms fill in over the tail of the outline
        // draw, so the handoff reads as one continuous motion tied to
        // scroll rather than two disconnected beats.
        tl.to(textEl, { fillOpacity: WORDMARK_OPACITY, ease: "none", duration: 0.4 }, 0.6);
      }, sectionRef);

      return () => ctx.revert();
    },
    [!!wordmarkBox],
    !reduceMotion
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-16 md:py-24"
      style={{ backgroundColor: CREAM }}
    >
      <h1 className="sr-only">Meet the Founders of Studio SP_ACE</h1>

      {/* Oversized wordmark, bleeding off both edges, sitting at the very
          top of the section -- exact same size/position/edge-bleed
          treatment as before (clamp()-driven font-size on this wrapper,
          THIS wrapper's own overflow-hidden cropping it wherever it runs
          past the edges, deliberately scoped here rather than the whole
          section so nothing below it -- the founder blocks, whose full
          text needs to be free to grow to any height -- is ever at risk of
          being clipped by an ancestor's overflow rule). The SVG's own
          width/height/viewBox are real, JS-measured pixel numbers (see the
          wordmarkBox state above) rather than CSS `100%`/`1em` with no
          viewBox -- deliberately avoids relying on the SVG inheriting the
          wrapper's font-size across the HTML/SVG boundary, which is where
          cross-browser sizing inconsistencies for unsized SVGs tend to
          live. Renders nothing until the first measurement resolves (one
          frame, invisible either way since this is a decorative,
          aria-hidden background element) rather than risk painting with a
          stale/zero box. */}
      <div
        ref={wordmarkWrapRef}
        className="relative w-full overflow-hidden"
        style={{ fontSize: "clamp(110px, 24vw, 340px)", height: "0.9em" }}
      >
        {wordmarkBox && (
          <svg
            width={wordmarkBox.width}
            height={wordmarkBox.height}
            viewBox={`0 0 ${wordmarkBox.width} ${wordmarkBox.height}`}
            aria-hidden="true"
            style={{ display: "block", overflow: "visible" }}
          >
            <text
              ref={wordmarkTextRef}
              x={wordmarkBox.width / 2}
              y={wordmarkBox.height / 2}
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fontFamily: "var(--font-agatho)",
                fontSize: wordmarkBox.fontSize,
                textTransform: "uppercase",
              }}
              fill={INK}
              fillOpacity={reduceMotion ? WORDMARK_OPACITY : 0}
              stroke={INK}
              strokeOpacity={reduceMotion ? WORDMARK_OPACITY : 0}
              strokeWidth={1.5}
            >
              Founders
            </text>
          </svg>
        )}
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
          intentionally once it's this much taller. */}
      <div className="mt-10 grid grid-cols-1 md:mt-14 md:grid-cols-[2fr_3fr] md:items-start">
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

        <div
          ref={headingRef}
          className="px-6 py-10 md:px-16 md:py-0"
          style={reduceMotion ? undefined : { opacity: 0 }}
        >
          <div className="relative inline-block">
            <OvalOutline />
            <h2
              className="relative text-[32px] md:text-[48px]"
              style={{ fontFamily: "var(--font-agatho)", color: INK }}
            >
              Meet The Founders
            </h2>
          </div>
          {/* TODO: placeholder tagline -- swap in the client's confirmed
              copy once provided. */}
          <p
            className="mt-4 max-w-2xl text-sm md:text-base"
            style={{ fontFamily: "var(--font-manrope)", color: MAROON }}
          >
            Two designers, one shared vision for how spaces should feel.
          </p>

          {/* Founder blocks, directly beneath the tagline in this same
              column -- Shubham's complete block, then Priyanka's complete
              block stacked below it. Side-by-side (tried first) read as
              congested at this column's width once both blocks carry a
              name, role, two paragraphs, and two pill buttons each -- a
              single stacked column with real vertical breathing room
              between them reads far more comfortably here. */}
          <div className="mt-10 flex flex-col gap-14">
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
        </div>
      </div>
    </section>
  );
}

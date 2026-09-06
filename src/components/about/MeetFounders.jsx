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

// The wordmark's low-opacity muted tone, shared by both the SVG text's
// stroke and its fill for the settled end state. Bumped up from the
// original 0.12 -- at that value the fully-drawn wordmark read as washed
// out rather than like a deliberate background element; 0.18 keeps it
// subordinate to foreground content while giving it real presence.
const WORDMARK_OPACITY = 0.18;

// A warm-maroon-tinted stroke color was tried for the draw-in-progress
// phase (blending INK toward MAROON, reverting to plain INK once filled)
// but was dropped after a screenshot comparison: at WORDMARK_OPACITY's low
// stroke-opacity against the cream background, the tint's rendered color
// delta versus plain INK was ~2-6 out of 255 -- imperceptible in practice,
// not worth the added complexity.

// The stroke's opacity WHILE it's actively drawing -- deliberately much
// darker than WORDMARK_OPACITY. That low resting value made the outline
// nearly invisible during the draw itself (the whole point of a hand-drawn
// reveal), which combined with an ambient (non-pinned) scroll trigger made
// it easy to scroll straight past without ever registering it was
// animating. Now pinned (see WORDMARK_PIN_VH below) so the draw is always
// seen, AND darkened so it reads clearly while it happens; it settles back
// down to WORDMARK_OPACITY as the fill-in completes (see the timeline).
const WORDMARK_ACTIVE_DRAW_OPACITY = 0.4;

// Height of the sticky frame the wordmark is centered in while pinned.
// Originally h-screen (100vh, matching every other pinned section's sticky
// box) but items-center inside a full 100vh frame left roughly 292px of
// plain cream empty above AND below the wordmark at a typical 1440x900
// viewport -- the wordmark itself is comparatively short (~0.9em), so
// centering it in a full screen height read as excessive empty space
// rather than a deliberate frame. Unlike other pinned sections (AboutHero,
// Quote, HeroQuoteTransition), this one has no full-bleed media that needs
// to cover the entire viewport while pinned -- it's flat CREAM either way
// -- so shrinking the sticky box itself is safe: the reduced area around it
// is still the same CREAM background from the outer (non-sticky) pin
// wrapper, with no color seam or visible gap. 68vh roughly halves that
// empty margin (down to ~150px/side at the same viewport) without
// shrinking the wordmark itself.
const WORDMARK_STICKY_VH = 68;

// Extra scroll distance reserved for the draw's scrub range (on top of
// WORDMARK_STICKY_VH below) -- same 60vh runway as before this pass, so the
// draw itself still plays out over the same amount of scroll and takes the
// same time; only the surrounding empty space shrank, not the animation.
const WORDMARK_RUNWAY_VH = 60;

// Total pinned scroll distance -- WORDMARK_STICKY_VH (how much of that is
// "spoken for" by the sticky frame itself, filling from the pin's own top)
// + WORDMARK_RUNWAY_VH (the extra scrub distance while held pinned). MUST
// stay derived from WORDMARK_STICKY_VH like this, not a separate literal --
// a sticky element only stays stuck for (this total - the sticky box's own
// height) of scroll before releasing, so if this were sized against a
// bigger assumed sticky height (e.g. the old 100vh/h-screen) than
// WORDMARK_STICKY_VH actually is now, the pin would stay stuck for LONGER
// than the runway needs, holding the fully-drawn wordmark still (with a
// growing dead gap beneath the now-smaller sticky box) for extra scroll
// that nothing was ever animating across -- which is exactly the "too much
// empty space below" bug this pass fixed.
const WORDMARK_PIN_VH = WORDMARK_STICKY_VH + WORDMARK_RUNWAY_VH;

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

// The client provided one joint note instead of two individual bios -- see
// FOUNDERS_NOTE below, rendered once beneath both founders' name/title/social
// blocks rather than duplicated per founder.
const FOUNDERS = [{ name: "Shubham" }, { name: "Priyanka" }];

const FOUNDERS_NOTE = [
  "For us, the best part of design is seeing an idea travel from a thought in our heads to something that actually exists. From the first sketch to the final detail on site, we love being part of that entire journey — especially figuring out how to make an idea work in the real world.",
  "We naturally bring different things to the table. Shubham is drawn to the technical side — how something will be made, detailed, and executed — while Priyanka gravitates towards the design side, from colours and materials to the overall feeling of a space. Somewhere between the two is where a lot of our favourite ideas come together.",
  "A space, to us, should tell you something about the people and purpose behind it. Their stories, experiences, interests, and the way they want a space to feel should find their way into the design, alongside a little of our own design language. We love that every project can have its own character.",
  "Travelling and observing are a big part of how we find inspiration. Spaces, buildings, materials, streets, and even small details stay with us, often finding their way into a project when we least expect them.",
  "As SP_ACE grows, we hope to take on bigger ideas, more places, and more ambitious projects — without losing what matters to us: creating spaces that feel personal, thoughtful, and true to the people and purpose behind them.",
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
      <div className="mt-6 flex gap-3">
        <PillLink href={INSTAGRAM_URL}>Instagram</PillLink>
        <PillLink href={LINKEDIN_URL}>LinkedIn</PillLink>
      </div>
    </div>
  );
}

export default function MeetFounders() {
  const sectionRef = useRef(null);
  const wordmarkPinRef = useRef(null);
  const wordmarkWrapRef = useRef(null);
  const wordmarkTextRef = useRef(null);
  const contentRef = useRef(null);
  const photoRef = useRef(null);
  const headingRef = useRef(null);
  const founderRefs = useRef([]);
  const noteRef = useRef(null);
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
  // deliberately NOT in this timeline -- its own pinned stroke-draw
  // sequence (below) is a fully separate, independent trigger, so the two
  // never fight over the same element. Triggers against contentRef (the
  // photo/heading/founders grid), NOT sectionRef -- sectionRef now also
  // contains the wordmark's ~160vh pin wrapper ahead of this content, so
  // "top 80%" measured against sectionRef's own top would fire (and fully
  // resolve, since this isn't scrubbed) long before the user has scrolled
  // anywhere near this content, defeating the point of a scroll-triggered
  // reveal. contentRef sits immediately above this grid, so "top 80%"
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

  // The wordmark's stroke-draw now runs while PINNED (position: sticky,
  // matching WORDMARK_PIN_VH's tall wrapper below), not during ambient
  // scroll-through -- an earlier version scrubbed the draw against ordinary
  // page scroll, which meant a fast scroll could carry the user straight
  // past the wordmark before it ever finished (or even visibly started)
  // drawing, with no way to tell it was working at all. Pinning guarantees
  // the full draw is always seen: the section can't scroll past until the
  // scrub distance is spent. ONE ScrollTrigger drives BOTH the pin (via the
  // sticky wrapper + matching wordmarkPinRef height in the JSX below -- see
  // brain.md's "golden rule" section on why this project uses sticky+scrub
  // instead of ScrollTrigger's own `pin: true`) AND the draw timeline --
  // never a separate pin trigger plus a separate draw trigger. wordmarkRef
  // is a plain, direct target of this trigger -- no ancestor of it is
  // independently transformed by anything else in this component (the
  // content timeline above only ever touches photoRef/headingRef/
  // founderRefs, and contentRef sits as an untransformed sibling below this
  // pin, never nested inside it), matching the golden rule every other
  // pinned/scrubbed section on this site follows. Scroll-scrubbed (scrub:
  // true, ease: "none") like every other pinned sequence here, so reverse
  // scroll correctly re-pins and undraws with no extra logic needed for
  // that (scrub tweens are just a function of scroll position).
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

        // Starts at WORDMARK_ACTIVE_DRAW_OPACITY (dark, clearly legible),
        // not WORDMARK_OPACITY -- the whole point of this pass is making the
        // in-progress draw visible; it settles down to the subtle resting
        // tone in Phase 2 below, once there's something fully drawn to
        // settle INTO.
        gsap.set(textEl, {
          strokeDasharray: estimatedLength,
          strokeDashoffset: estimatedLength,
          strokeOpacity: WORDMARK_ACTIVE_DRAW_OPACITY,
          fillOpacity: 0,
        });

        // Anchors the timeline to 1 "unit" so every position argument below
        // reads as a literal fraction of the pinned scroll range -- same
        // trick AboutHero's own pinned timeline uses, including for the
        // trailing hold, where nothing animates but the settled state still
        // needs scroll distance to sit still in before the pin releases.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: wordmarkPinRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        });
        tl.to({}, { duration: 1 }, 0);

        // Phase 1 (0%-55%): the hand-drawn outline traces in, staying at
        // the dark active-draw opacity the whole time it's drawing.
        tl.to(textEl, { strokeDashoffset: 0, ease: "none", duration: 0.55 }, 0);
        // Phase 2 (45%-80%): the letterforms fill in while the stroke
        // settles from the dark active-draw tone down to the subtle
        // WORDMARK_OPACITY resting tone, both tied to the same window so
        // the handoff reads as one continuous "finishing" motion. Starts
        // slightly before Phase 1 ends so the two read as one continuous
        // gesture rather than two disconnected beats.
        tl.to(
          textEl,
          { fillOpacity: WORDMARK_OPACITY, strokeOpacity: WORDMARK_OPACITY, ease: "none", duration: 0.35 },
          0.45
        );

        // Hold (80%-100%): the finished wordmark stays visible for a real
        // stretch of scroll before the pin releases -- without this, the
        // settle tween's end would land exactly at the pin's release point,
        // so the completed wordmark would only ever be on screen for a
        // single frame before scrolling away, undermining the entire point
        // of pinning (same reasoning as Quote's and AboutHero's own
        // trailing holds).
      }, wordmarkPinRef);

      return () => ctx.revert();
    },
    [!!wordmarkBox],
    !reduceMotion
  );

  // Extracted so the exact same wordmark markup renders in both branches
  // below -- only its wrapper (plain vs. pinned+sticky) differs between
  // reduceMotion and the animated path.
  const wordmarkWrapper = (
    <div
      ref={wordmarkWrapRef}
      className={`relative w-full overflow-hidden${reduceMotion ? " mt-16 md:mt-24" : ""}`}
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
            strokeWidth={2.25}
          >
            Founders
          </text>
        </svg>
      )}
    </div>
  );

  return (
    <section ref={sectionRef} className="relative w-full" style={{ backgroundColor: CREAM }}>
      <h1 className="sr-only">Meet the Founders of Studio SP_ACE</h1>

      {/* Oversized wordmark, bleeding off both edges (clamp()-driven
          font-size on wordmarkWrapRef, THIS wrapper's own overflow-hidden
          cropping it wherever it runs past the edges, deliberately scoped
          here rather than the whole section so nothing below it -- the
          founder blocks, whose full text needs to be free to grow to any
          height -- is ever at risk of being clipped by an ancestor's
          overflow rule). The SVG's own width/height/viewBox are real,
          JS-measured pixel numbers (see the wordmarkBox state above) rather
          than CSS `100%`/`1em` with no viewBox -- deliberately avoids
          relying on the SVG inheriting the wrapper's font-size across the
          HTML/SVG boundary, which is where cross-browser sizing
          inconsistencies for unsized SVGs tend to live. Renders nothing
          until the first measurement resolves (one frame, invisible either
          way since this is a decorative, aria-hidden background element)
          rather than risk painting with a stale/zero box.

          reduceMotion: rendered plain, in normal flow, already at its final
          filled state (no pin, no draw -- see wordmarkWrapper's fillOpacity/
          strokeOpacity above). Otherwise: wrapped in a ~160vh pin (
          wordmarkPinRef) whose inner sticky box holds it centered on screen
          for the whole scrub range, so the draw effect built by the
          usePreloaderGate hook above is always fully seen regardless of
          scroll speed -- see that hook for the pin+draw ScrollTrigger
          itself. */}
      {reduceMotion ? (
        wordmarkWrapper
      ) : (
        <div ref={wordmarkPinRef} className="relative w-full" style={{ height: `${WORDMARK_PIN_VH}vh` }}>
          <div
            className="sticky top-0 flex w-full items-center overflow-hidden"
            style={{ height: `${WORDMARK_STICKY_VH}vh`, backgroundColor: CREAM }}
          >
            {wordmarkWrapper}
          </div>
        </div>
      )}

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

            {/* Founder blocks -- name, role, and social links only now (the
                client provided one shared note instead of two individual
                bios, see FOUNDERS_NOTE/noteRef below), so side-by-side reads
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

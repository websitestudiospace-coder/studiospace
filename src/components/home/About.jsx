"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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

// Image width keyframes (percent of the pinned viewport) across the five
// choreographed phases of the scroll timeline -- percentages below are the
// ACTUAL tween positions/durations from the timeline further down (the
// original values here had drifted out of sync with those; corrected
// alongside the Phase 4 retiming below).
const IMAGE_PHASE1_WIDTH = 28; // 0%-8%: grows from nothing
const IMAGE_SETTLE_WIDTH = 46; // 8%-35%: grows toward the settled layout
// Also doubles as the text panel's fixed left offset/width (see the
// `textRef` style below) -- that's a layout position, not an image-growth
// keyframe, and must NOT change independently of a deliberate text-column
// reflow decision. The image itself barely reaches this value (46->48,
// see Phase 3 below) and isn't allowed to grow past it until Phase 4,
// since the text panel sits fully opaque and static at exactly this left
// edge until then -- letting the image cross earlier would visibly creep
// a grayscale image behind fully-legible text.
const IMAGE_HOLD_WIDTH = 48; // 35%-65%: settled, barely creeps (this window is a text-reading hold, not an image animation -- same role as Quote.jsx's holds)
const IMAGE_FULL_WIDTH = 100; // 65%-95%: resumes growth to full-bleed, gradually

const TEXT_SLIDE_X = 40; // px slide distance used on both the in and out tweens

function AboutCopy() {
  return (
    <>
      <p
        className="uppercase tracking-[0.2em] text-xs md:text-sm"
        style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.65 }}
      >
        About Studio SP_ACE
      </p>
      <h2
        className="mt-4 text-[32px] md:text-[48px]"
        style={{
          fontFamily: "var(--font-agatho)",
          lineHeight: 1.25,
          color: INK,
        }}
      >
        Design that begins with your story.
      </h2>
      <p
        className="mt-6 text-sm md:text-base"
        style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.65 }}
      >
        Based in Bangalore and working pan-India, Studio SP_ACE is a bespoke
        interior design studio offering a complete journey from design to
        execution. Every project begins with getting to know the people
        behind the space, their experiences, personalities and the way they
        live. We bring these details into the design to create interiors
        that are not just designed for our clients, but feel inherently like
        them.
      </p>
      <Link
        href="/about"
        className="mt-8 inline-block w-max uppercase tracking-[0.15em] text-xs md:text-sm border-b pb-1"
        style={{
          fontFamily: "var(--font-manrope)",
          color: INK,
          borderColor: INK,
        }}
      >
        About Us
      </Link>
    </>
  );
}

export default function About() {
  const outerRef = useRef(null);
  const imageRef = useRef(null);
  const textRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Desktop-only, same rule as Projects.jsx: the pinned sequence relies on
  // an absolutely-positioned image/text split (image width tweened as a %,
  // text box pinned at a fixed left offset) that has no mobile-width
  // equivalent -- squeezing it into a narrow viewport is what clipped the
  // heading, cut the body text off mid-paragraph, and pushed the "About Us"
  // link off-screen. Mobile always falls through to the plain stacked
  // "!enhanced" branch below instead.
  const enhanced = !reduceMotion && isDesktop;

  // HeroQuoteTransition's hero pin and Quote's own scroll triggers default
  // to their unpinned/simple layout on first render and only upgrade to
  // the pinned/complex layout a commit later, once their own matchMedia
  // checks resolve. If this section's ScrollTrigger is created immediately
  // on mount (same as previous attempts here), it measures its position
  // against that pre-upgrade layout, and calling ScrollTrigger.refresh()
  // afterward does not correct it — confirmed by direct testing: even a
  // native "resize" event (which ScrollTrigger listens to for its own
  // auto-refresh) left `start` locked at the stale value. The reliable
  // fix is to not create the trigger until layout has already settled,
  // rather than trying to patch a wrong initial measurement after the
  // fact. Preloader.jsx dispatches "preloader:complete" (and sets
  // window.__preloaderDone) once its own ~3.8s intro finishes and unlocks
  // body scroll — by then every other component's mount-time layout
  // change has long since happened, so it's a reliable point to measure
  // from for the first time.
  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        // Single ScrollTrigger owns this whole section's timeline: every
        // phase below is a tween on this one scrub, positioned at an
        // absolute fraction of the timeline, so the choreography can't
        // drift out of sync the way separate triggers would.
        gsap.set(imageRef.current, { width: "0%" });
        gsap.set(textRef.current, { opacity: 0, x: TEXT_SLIDE_X });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: outerRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
          },
        });

        // Anchor the timeline's total length to 1 "unit" so every position
        // argument below reads as a literal fraction of the scroll range —
        // including the trailing 90%-100% hold, where nothing animates but
        // the full-bleed image still needs to occupy scroll distance.
        tl.to({}, { duration: 1 }, 0);

        // Phase 1 (0%-8%): image grows from nothing; text stays hidden.
        // Kept short — this is the only phase where the section reads as
        // "empty," so it shouldn't consume much scroll distance.
        tl.to(
          imageRef.current,
          { width: `${IMAGE_PHASE1_WIDTH}%`, ease: "none", duration: 0.08 },
          0
        );

        // Phase 2 (8%-35%): image keeps growing toward its settled width
        // while text slides and fades in, as if pulled into view by the
        // image's advancing right edge.
        tl.to(
          imageRef.current,
          { width: `${IMAGE_SETTLE_WIDTH}%`, ease: "none", duration: 0.27 },
          0.08
        );
        tl.to(
          textRef.current,
          { opacity: 1, x: 0, ease: "none", duration: 0.27 },
          0.08
        );

        // Phase 3 (35%-65%): settled state — image barely creeps, text
        // holds fully visible. No text tween here; it simply holds its
        // Phase 2 end value.
        tl.to(
          imageRef.current,
          { width: `${IMAGE_HOLD_WIDTH}%`, ease: "none", duration: 0.3 },
          0.35
        );

        // Phase 4 (65%-95%): image resumes growing to full-bleed; text
        // fades and slides out, finishing at 0.8, well before the image
        // reaches 100% width at 0.95.
        //
        // This is the phase that used to read as an abrupt jump: it was
        // previously only 20% of the scroll range (0.65-0.85) carrying 52
        // of the image's 100 total width points -- over half the image's
        // entire growth compressed into a fifth of the scroll, right after
        // Phase 3's plateau. Extending it to 30% (duration 0.2 -> 0.3)
        // reclaims scroll distance from Phase 5 below, which was pure dead
        // weight (full-bleed already reached, nothing left to animate) --
        // Phases 1-3 and the text fade timing are untouched, so the
        // text-reading hold (Phase 3) and the no-overlap-before-fade-out
        // guarantee (see IMAGE_HOLD_WIDTH above) both still hold exactly
        // as before.
        tl.to(
          imageRef.current,
          {
            width: `${IMAGE_FULL_WIDTH}%`,
            height: "100%",
            filter: "grayscale(0%)",
            ease: "none",
            duration: 0.3,
          },
          0.65
        );
        tl.to(
          textRef.current,
          { opacity: 0, x: TEXT_SLIDE_X, ease: "none", duration: 0.15 },
          0.65
        );

        // Phase 5 (95%-100%): full-bleed image holds, text long gone — no
        // tweens needed, just the scroll distance reserved by the anchor
        // above. Kept short but non-zero (not 0%) so the settled full-bleed
        // state gets a real, if brief, dwell before the pin releases,
        // rather than reading as "stuck" for a single frame -- same
        // reasoning as Quote.jsx's own closing hold.
      }, outerRef);

      return () => ctx.revert();
    },
    [],
    enhanced
  );

  if (!enhanced) {
    // Shared fallback for both the reduced-motion opt-out and mobile/narrow
    // viewports -- stacks image-over-text (full width) below md, sits side
    // by side at md and up.
    return (
      <section
        className="flex w-full flex-col items-center gap-8 px-6 py-16 md:flex-row md:gap-12 md:px-8 md:py-24 lg:px-16"
        style={{ backgroundColor: CREAM }}
      >
        <div className="relative h-[50vh] w-full overflow-hidden md:h-[70vh] md:w-[55%]">
          <Image
            src="/images/about/about-hero.jpg"
            alt="Studio SP_ACE"
            fill
            sizes="(max-width: 767px) 100vw, 55vw"
            className="object-cover grayscale"
          />
        </div>
        <div className="w-full md:w-[45%]">
          <AboutCopy />
        </div>
      </section>
    );
  }

  return (
    <section
      ref={outerRef}
      className="relative w-full"
      style={{
        // svh (not vh) throughout this section's geometry -- vh resolves to
        // the LARGEST possible mobile-Safari viewport (address bar
        // collapsed), taller than what's actually on screen whenever the
        // bar is showing. That mismatch between the sticky box's CSS height
        // and ScrollTrigger's own window.innerHeight-based measurement is
        // what let the "About Us" link land outside the reachable/tappable
        // area on real mobile devices, even though the <Link> itself was
        // always correctly wired to /about -- headless/devtools mobile
        // emulation doesn't reproduce the dynamic toolbar, which is why
        // that particular failure mode didn't show up in automated testing.
        // Hero.jsx already solved this identical class of bug with
        // h-[100svh]; mixing vh and svh across this section's own
        // height/marginTop/sticky-child trio would just relocate the same
        // desync, so all three switch together.
        height: "125svh",
        // Quote's sticky reveal above (Quote.jsx) fully finishes its own
        // scrub well before its sticky child naturally scrolls itself out
        // of view — CSS `sticky` requires a full extra 100svh of scroll for
        // that, and Quote's text is done and gone roughly 35svh into it,
        // leaving the remainder as blank cream. Pulling this section up to
        // start there removes that gap without touching Quote's own
        // (working) sticky mechanics.
        marginTop: "-35svh",
      }}
    >
      <div
        className="sticky top-0 h-[100svh] w-full overflow-hidden"
        style={{ backgroundColor: CREAM }}
      >
        <div
          ref={imageRef}
          className="absolute left-0 top-0 h-full overflow-hidden"
          style={{ width: "0%", filter: "grayscale(100%)" }}
        >
          <Image
            src="/images/about/about-hero.jpg"
            alt="Studio SP_ACE"
            fill
            sizes="50vw"
            className="object-cover"
          />
        </div>

        {/* Box stays fixed at the settled-layout position for the whole
            timeline — only opacity/x (the entrance/exit slide) animate. */}
        <div
          ref={textRef}
          className="absolute top-0 flex h-full flex-col justify-center px-8 md:px-12 lg:px-16"
          style={{
            left: `${IMAGE_HOLD_WIDTH}%`,
            width: `${100 - IMAGE_HOLD_WIDTH}%`,
          }}
        >
          <div className="mb-[10%]">
            <AboutCopy />
          </div>
        </div>
      </div>
    </section>
  );
}

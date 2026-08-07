"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const INK = "#2B2622";

// Image width keyframes (percent of the pinned viewport) across the five
// choreographed phases of the scroll timeline.
const IMAGE_PHASE1_WIDTH = 28; // 0%-20%: grows from nothing
const IMAGE_SETTLE_WIDTH = 46; // 20%-45%: grows toward the settled layout
const IMAGE_HOLD_WIDTH = 48; // 45%-70%: settled, barely creeps
const IMAGE_FULL_WIDTH = 100; // 70%-90%: resumes growth to full-bleed

const TEXT_SLIDE_X = 40; // px slide distance used on both the in and out tweens

function AboutCopy() {
  return (
    <>
      <p
        className="uppercase tracking-[0.2em] text-xs md:text-sm"
        style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.6 }}
      >
        About Splace
      </p>
      <h2
        className="mt-4"
        style={{
          fontFamily: "var(--font-agatho)",
          fontSize: "clamp(24px, 3vw, 40px)",
          lineHeight: 1.25,
          color: INK,
        }}
      >
        A studio built on honest materials, quiet detail, and homes that feel
        like you.
      </h2>
      {/* TODO: replace with real founding story from client */}
      <p
        className="mt-6 text-sm md:text-base"
        style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.65 }}
      >
        Splace was founded on the belief that a home should be designed
        around the way you actually live in it. We work closely with every
        client, blending timeless materials with careful, considered detail
        to create spaces that feel warm, personal, and built to last.
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
  const [isMobile, setIsMobile] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mobileMql = window.matchMedia("(max-width: 767px)");
    const motionMql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMobile = () => setIsMobile(mobileMql.matches);
    const updateMotion = () => setReduceMotion(motionMql.matches);
    updateMobile();
    updateMotion();
    mobileMql.addEventListener("change", updateMobile);
    motionMql.addEventListener("change", updateMotion);
    return () => {
      mobileMql.removeEventListener("change", updateMobile);
      motionMql.removeEventListener("change", updateMotion);
    };
  }, []);

  const enhanced = !isMobile && !reduceMotion;

  useEffect(() => {
    if (!enhanced) return;

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
    let ctx;

    const setup = () => {
      ctx = gsap.context(() => {
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
            scrub: 1,
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
          { width: `${IMAGE_PHASE1_WIDTH}%`, ease: "power2.out", duration: 0.08 },
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

        // Phase 4 (65%-85%): image resumes growing to full-bleed; text
        // fades and slides out, finishing at 0.8 so it's fully gone
        // before the image reaches 100% width at 0.85.
        tl.to(
          imageRef.current,
          {
            width: `${IMAGE_FULL_WIDTH}%`,
            height: "100%",
            filter: "grayscale(0%)",
            ease: "none",
            duration: 0.2,
          },
          0.65
        );
        tl.to(
          textRef.current,
          { opacity: 0, x: TEXT_SLIDE_X, ease: "none", duration: 0.15 },
          0.65
        );

        // Phase 5 (85%-100%): full-bleed image holds, text long gone — no
        // tweens needed, just the scroll distance reserved by the anchor
        // above.
      }, outerRef);
    };

    if (window.__preloaderDone) {
      setup();
    } else {
      window.addEventListener("preloader:complete", setup, { once: true });
    }

    return () => {
      ctx?.revert();
      window.removeEventListener("preloader:complete", setup);
    };
  }, [enhanced]);

  if (isMobile) {
    return (
      <section className="w-full px-6 py-16" style={{ backgroundColor: CREAM }}>
        <div className="relative h-[50vh] w-full overflow-hidden">
          <Image
            src="/images/about/about-hero.jpg"
            alt="Splace studio"
            fill
            sizes="100vw"
            className="object-cover grayscale"
          />
        </div>
        <div className="mt-10">
          <AboutCopy />
        </div>
      </section>
    );
  }

  if (reduceMotion) {
    return (
      <section
        className="flex w-full items-center gap-12 px-8 py-24 lg:px-16"
        style={{ backgroundColor: CREAM }}
      >
        <div className="relative h-[70vh] w-[55%] overflow-hidden">
          <Image
            src="/images/about/about-hero.jpg"
            alt="Splace studio"
            fill
            sizes="55vw"
            className="object-cover grayscale"
          />
        </div>
        <div className="w-[45%]">
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
        height: "200vh",
        // Quote's sticky reveal above (Quote.jsx) fully finishes its own
        // scrub well before its sticky child naturally scrolls itself out
        // of view — CSS `sticky` requires a full extra 100vh of scroll for
        // that, and Quote's text is done and gone roughly 35vh into it,
        // leaving the remainder as blank cream. Pulling this section up to
        // start there removes that gap without touching Quote's own
        // (working) sticky mechanics.
        marginTop: "-35vh",
      }}
    >
      <div
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ backgroundColor: CREAM }}
      >
        <div
          ref={imageRef}
          className="absolute left-0 top-0 h-full overflow-hidden"
          style={{ width: "0%", filter: "grayscale(100%)" }}
        >
          <Image
            src="/images/about/about-hero.jpg"
            alt="Splace studio"
            fill
            sizes="100vw"
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

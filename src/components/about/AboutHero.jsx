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

// Total pinned scroll distance: 100vh of viewport plus 70vh of runway for the
// shrink/desaturate, text reveal and closing hold.
const SECTION_HEIGHT_VH = 170;

// Settled image width -- also the text panel's fixed left offset/width.
const SETTLED_IMAGE_WIDTH = 50;

// Slide distance used on the text panel's entrance -- same value and role
// as home/About.jsx's own TEXT_SLIDE_X.
const TEXT_SLIDE_X = 40;

// Mobile: the photo pins full-screen and shrinks 100vh -> 50vh over a runway
// equal to the height it loses (see the mobile branch for why they match).
const MOBILE_SETTLED_IMAGE_VH = 50;
const MOBILE_SHRINK_RUNWAY_VH = 100 - MOBILE_SETTLED_IMAGE_VH;

// Micro-label styling shared by both groups below -- same treatment the
// old single "Our Studio" label used.
const LABEL_CLASS = "text-xs uppercase tracking-[0.2em] md:text-sm";
const BODY_CLASS = "max-w-2xl text-sm md:text-base";
const COPY_STYLE = { fontFamily: "var(--font-manrope)", color: INK, opacity: 0.65 };

// Studio copy in two labelled parts, per the client's reference doc:
// "About Studio SP_ACE" and "Our Story".
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

  // The pinned image/text split only works at desktop widths; mobile has its
  // own branch below.
  const enhanced = !reduceMotion && isDesktop;

  // First section on the page, so its "top top" position doesn't depend on
  // anything above settling -- no need to wait for the preloader.
  useEffect(() => {
    if (!enhanced) return;

    const ctx = gsap.context(() => {
      gsap.set(imageRef.current, { width: "100%", filter: "grayscale(0%)" });
      gsap.set(textRef.current, { opacity: 0, x: TEXT_SLIDE_X });

      // One ScrollTrigger and one timeline for shrink, desaturate and text.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: outerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      // Timeline length pinned to 1 so positions read as fractions of the
      // scroll range (including the final hold).
      tl.to({}, { duration: 1 }, 0);

      // Phase 1 (0%-55%): image shrinks to half width while going from
      // colour to black & white.
      tl.to(imageRef.current, { width: `${SETTLED_IMAGE_WIDTH}%`, ease: "none", duration: 0.55 }, 0);
      tl.to(imageRef.current, { filter: "grayscale(100%)", ease: "none", duration: 0.55 }, 0);

      // Phase 2 (45%-75%): copy fades/slides in, overlapping the end of
      // Phase 1 so there's no dead beat between them.
      tl.to(textRef.current, { opacity: 1, x: 0, ease: "none", duration: 0.3 }, 0.45);

      // Phase 3 (75%-100%): hold the settled state before the pin releases.
    }, outerRef);

    return () => ctx.revert();
  }, [enhanced]);

  // Mobile: the photo's height scrubs 100% -> 50% linearly across the whole
  // runway, so its bottom edge moves at exactly scroll speed and the
  // pulled-up copy below stays attached to it. Colour drains to black &
  // white on the same scrub. Reduced motion gets the settled 50vh photo.
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

  // Mobile (with or without reduced motion). Photo cropped at 35%
  // horizontally (client's choice). The section is 100vh plus a 50vh runway
  // with the photo in a sticky h-screen wrapper; the copy is pulled up by
  // the same runway, so its top always sits at the photo's bottom edge.
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
          {/* z-[1] keeps the photo above the pulled-up copy;
              pointer-events-none because the wrapper's empty lower half sits
              over that copy mid-pin. */}
          <div className={mobileShrink ? "pointer-events-none sticky top-0 z-[1] h-screen w-full" : "w-full"}>
            {/* Height via classes, never inline: if reduced motion resolves
                after the tween starts, ctx.revert() restores the first inline
                height GSAP saw and an inline "100%" would collapse the static
                box. h-[50vh] matches MOBILE_SETTLED_IMAGE_VH. */}
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
              {/* Dark top band so the transparent Nav stays legible over the
                  light sky. */}
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
    // Reduced motion at md+ (mobile has its own branch above): padded
    // side-by-side layout.
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
          {/* Dark top band for the transparent Nav (mobile only; at md+ the
              photo sits in padded flow). */}
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

        {/* Dark top band so the transparent Nav (cream text) stays legible
            over the photo's light top edge; full-bleed regardless of the
            image's animated width. */}
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

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

// Image width keyframes (percent of the pinned frame) for the desktop scroll
// timeline below.
const IMAGE_PHASE1_WIDTH = 28; // 0%-8%: grows from nothing
const IMAGE_SETTLE_WIDTH = 46; // 8%-35%: grows toward the settled layout
// Also the text panel's fixed left edge/width. The image must not grow past
// it until Phase 4, while the text is fully visible on top.
const IMAGE_HOLD_WIDTH = 48; // 35%-65%: reading hold, image barely moves
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
        execution.
      </p>
      <p
        className="mt-4 text-sm md:text-base"
        style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.65 }}
      >
        Every project begins with getting to know the people behind the
        space, their experiences, personalities and the way they live. We
        bring these details into the design to create interiors that are not
        just designed for our clients, but feel inherently like them.
      </p>
      <Link
        href="/about"
        className="hit-area mt-8 inline-block w-max uppercase tracking-[0.15em] text-xs md:text-sm border-b pb-1"
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
  const mobileImageRef = useRef(null);
  const mobileTextRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // The pinned image/text split only works at desktop widths; mobile and
  // reduced motion use the stacked layout in the `!enhanced` branch below.
  const enhanced = !reduceMotion && isDesktop;

  // Waits for the preloader: sections above (hero pin, Quote) settle their
  // layout a commit after mount, and a trigger created earlier keeps a stale
  // `start` that ScrollTrigger.refresh() doesn't correct.
  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        // One scrubbed timeline for the whole section; every phase is placed
        // at an absolute fraction of it so the phases can't drift apart.
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

        // Pin the timeline length to 1 so positions below read as fractions
        // of the scroll range (including the final hold where nothing moves).
        tl.to({}, { duration: 1 }, 0);

        // Phase 1 (0%-8%): image grows from nothing; text hidden.
        tl.to(
          imageRef.current,
          { width: `${IMAGE_PHASE1_WIDTH}%`, ease: "none", duration: 0.08 },
          0
        );

        // Phase 2 (8%-35%): image grows toward its settled width while the
        // text slides/fades in.
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

        // Phase 3 (35%-65%): settled; image barely creeps, text holds.
        tl.to(
          imageRef.current,
          { width: `${IMAGE_HOLD_WIDTH}%`, ease: "none", duration: 0.3 },
          0.35
        );

        // Phase 4 (65%-95%): image grows to full-bleed and turns to colour;
        // text fades out by 0.8, before the image passes under it.
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

        // Phase 5 (95%-100%): brief hold on the full-bleed image before the
        // pin releases (reserved by the length anchor above).
      }, outerRef);

      return () => ctx.revert();
    },
    [],
    enhanced
  );

  // Mobile: no pin. The photo scales up from 0.9 and goes grayscale -> colour
  // as it scrolls in; the copy fades up once. Reduced motion stays static.
  const mobileAnim = !reduceMotion && !isDesktop;

  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          mobileImageRef.current,
          { scale: 0.9, filter: "grayscale(100%)" },
          {
            scale: 1,
            filter: "grayscale(0%)",
            ease: "none",
            scrollTrigger: {
              trigger: mobileImageRef.current,
              start: "top 90%",
              end: "top 25%",
              scrub: true,
            },
          }
        );
        gsap.from(mobileTextRef.current, {
          opacity: 0,
          y: 24,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: mobileTextRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      });

      return () => ctx.revert();
    },
    [],
    mobileAnim
  );

  if (!enhanced) {
    // Mobile and reduced motion: image over text below md, side by side
    // (edge to edge) from md up.
    return (
      <section
        className="relative flex w-full flex-col items-center gap-8 px-6 py-16 md:flex-row md:gap-12 md:px-0 md:py-24"
        style={{
          backgroundColor: CREAM,
          // Mobile only: pull up under Quote's 65svh pinned frame so this
          // content starts ~50-75px below the quote's last line. Tied to
          // Quote.jsx's frame/section heights -- change them together.
          ...(mobileAnim ? { marginTop: "calc(117px - 32.5svh)" } : undefined),
        }}
      >
        {/* On the animated mobile path the grayscale lives on this wrapper
            (GSAP's start state), not on the image's `grayscale` class. */}
        <div
          ref={mobileImageRef}
          className="relative h-[50vh] w-full overflow-hidden md:h-[70vh] md:w-[55%]"
          style={mobileAnim ? { filter: "grayscale(100%)", transform: "scale(0.9)" } : undefined}
        >
          <Image
            src="/images/about/about-hero.jpg"
            alt="Studio SP_ACE"
            fill
            sizes="(max-width: 767px) 100vw, 55vw"
            className={mobileAnim ? "object-cover" : "object-cover grayscale"}
          />
        </div>
        <div ref={mobileTextRef} className="w-full md:w-[45%] md:pr-8 lg:pr-16">
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
        // svh, not vh: on mobile Safari vh is the toolbar-collapsed height,
        // which desyncs the sticky box from ScrollTrigger's measurements and
        // pushed the "About Us" link out of reach. Keep all three in svh.
        height: "125svh",
        // Starts 35svh early, where Quote's text has already finished, to
        // skip the blank tail of Quote's sticky frame.
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
            // Width is tweened from 0% to 100%, so request full-width
            // resolution (a static `sizes` can't follow the animation).
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {/* Fixed at the settled position; only opacity/x animate. */}
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

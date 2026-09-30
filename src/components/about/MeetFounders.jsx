"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";
import InlineWordmark from "@/components/ui/InlineWordmark";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const INK = "#2B2622";
const MAROON = "#6E1F24";

// Sticky offset for the right-hand column: clears the fixed Nav (~104px at md)
// plus a little breathing room.
const STICKY_COLUMN_TOP_PX = 128;

// portrait 1.jpg's real pixel size, so next/image lays it out uncropped at
// its natural ratio.
const PHOTO_WIDTH = 2400;
const PHOTO_HEIGHT = 3578;

// Wording from the studio's Instagram bio ("Founders & Principal Designers");
// shared by both founders.
const TITLE = "Founder & Principal Designer";

// One joint note from the client instead of two bios, rendered once beneath
// both founders (see FOUNDERS_NOTE).
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

  // "The People Behind SP_ACE" heading: scroll-scrubbed zoom-in (the client
  // wanted it to follow the scroll, not play on a timer), then the flanking
  // lines scale out from the text.
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

  // One-shot staggered reveal (photo, heading block, founder columns) on one
  // timeline and one trigger, separate from the heading's trigger above.
  // Triggers on contentRef, not sectionRef, because the section also
  // contains the tall heading block. Waits for the preloader so "top 80%"
  // is measured against AboutHero's settled layout.
  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        const founders = founderRefs.current.filter(Boolean);
        const targets = [photoRef.current, headingRef.current, ...founders, noteRef.current];

        // Start states are set immediately before the tween so nothing can
        // be left at opacity 0 without an animation queued.
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

      {/* "The People Behind SP_ACE". Reduced motion renders it settled. */}
      <div
        ref={peopleHeadingWrapRef}
        // min-h-[30vh] on mobile: 50vh left ~190px of blank space around the
        // one-line heading. The zoom's scrub window is measured from the
        // box's top, so it still plays in full.
        className="flex min-h-[30vh] w-full items-center justify-center gap-6 px-6 md:min-h-[58vh]"
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
          // min(8.2vw, 36px) below md: at a flat text-4xl the nowrap heading
          // (~378px) outgrew the 375px viewport's 327px content width.
          className="whitespace-nowrap text-[min(8.2vw,2.25rem)] md:text-6xl lg:text-7xl"
          style={{
            fontFamily: "var(--font-agatho)",
            color: INK,
            transformOrigin: "center",
            ...(reduceMotion ? undefined : { opacity: 0 }),
          }}
        >
          The People Behind <InlineWordmark text="SP_ACE" />
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

      {/* Photo bleeds to the left edge (~40% of the row); the right column
          (~60%) holds the heading, tagline and founders. items-start because
          the right column is much taller than the photo. */}
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

        {/* md:self-stretch makes this column as tall as the row, giving the
            sticky child below room to stick. */}
        <div ref={headingRef} className="md:self-stretch" style={reduceMotion ? undefined : { opacity: 0 }}>
          {/* Sticky on md+ only (on mobile the photo and column stack, so
              there's nothing to scroll past). top clears the fixed Nav. */}
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
            {/* TODO: placeholder tagline -- replace with the client's copy. */}
            <p
              className="mt-4 max-w-2xl text-sm md:text-base"
              style={{ fontFamily: "var(--font-manrope)", color: MAROON }}
            >
              Two designers, one shared vision for how spaces should feel.
            </p>

            {/* Founder name and role, side by side. */}
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

            {/* Founders' note, shared by both. */}
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

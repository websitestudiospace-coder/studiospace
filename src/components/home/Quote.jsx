"use client";

import { Fragment, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useReducedMotion from "@/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const INK = "#2B2622";
const MUTED_OPACITY = 0.32;
const HEADING_SIZE_CLASS = "text-[36px] md:text-[64px]";
const LINE_HEIGHT = 1.18;

const QUOTE_1 =
  "Thoughtfully designed architecture and interiors, crafted around your story.";
const QUOTE_2 = "Where timeless design meets the way you truly live.";

export default function Quote() {
  const wrapperRef = useRef(null);
  const stickyRef = useRef(null);
  const quote1Ref = useRef(null);
  const quote2Ref = useRef(null);
  const q1WordsRef = useRef([]);
  const q2CharsRef = useRef([]);
  // Pinned sequence at every width; only reduced motion opts out. Starts
  // `true` to avoid a first-paint flash before matchMedia resolves.
  const simple = useReducedMotion(true);

  const q1Words = QUOTE_1.split(" ");
  const q2Words = QUOTE_2.split(" ");

  useEffect(() => {
    if (simple) return;

    const ctx = gsap.context(() => {
      // Space characters don't get a ref (see JSX below), so this array has
      // holes at those indices — filter them out before handing it to gsap.
      const q2CharEls = q2CharsRef.current.filter(Boolean);

      gsap.set(quote2Ref.current, {
        visibility: "hidden",
        pointerEvents: "none",
      });
      gsap.set(q2CharEls, {
        opacity: 0,
        yPercent: 120,
        scaleY: 2.3,
        scaleX: 0.7,
        transformOrigin: "50% 0%",
      });
      gsap.set(quote2Ref.current, { yPercent: 15 });

      // Quote's arrival: fade/scale in its own root as it scrolls up into
      // place (no transformed ancestor, so measurements stay clean).
      gsap.set(wrapperRef.current, { opacity: 0, scale: 0.97 });
      gsap.to(wrapperRef.current, {
        opacity: 1,
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top bottom",
          end: "top top",
          scrub: true,
        },
      });

      const q1WordEls = q1WordsRef.current.filter(Boolean);

      // The scrub lasts exactly as long as the frame stays pinned: section
      // height minus frame height (35vh desktop, 35svh mobile).
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: () => `+=${wrapperRef.current.offsetHeight - stickyRef.current.offsetHeight}`,
          invalidateOnRefresh: true,
          scrub: true,
        },
      });

      // Phase A: reveal Quote 1 word by word in reading order (gray -> dark).
      // Timing within the 35vh pin: short reveal/recede, long holds for
      // reading (~9/27/5/2/30/27%).
      tl.to(q1WordEls, {
        opacity: 1,
        color: INK,
        duration: 0.7,
        stagger: 0.06,
        ease: "none",
      });

      // Hold so the full sentence is readable before it recedes.
      tl.to({}, { duration: 3.5 });

      // Phase A: recede Quote 1 (dark -> gray), drifting up slightly.
      const recedeStart = tl.duration();
      tl.to(q1WordEls, {
        opacity: MUTED_OPACITY,
        color: INK,
        duration: 0.4,
        stagger: 0.035,
        ease: "none",
      });
      const recedeDuration = tl.duration() - recedeStart;
      tl.to(
        quote1Ref.current,
        { yPercent: -15, ease: "none", duration: recedeDuration },
        recedeStart
      );

      // Quote 1 fully faded — remove it from the visual stack
      tl.set(quote1Ref.current, {
        visibility: "hidden",
        pointerEvents: "none",
      });

      // Buffer — brief pause between Quote 1 fading out and Quote 2 arriving.
      // Kept short so this doesn't read as dead scroll space.
      tl.to({}, { duration: 0.2 });

      // Phase B: Quote 2 floats in character by character while the container
      // rises slightly.
      tl.set(quote2Ref.current, {
        visibility: "visible",
        pointerEvents: "auto",
      });
      const riseStart = tl.duration();
      tl.to(q2CharEls, {
        opacity: 1,
        yPercent: 0,
        scaleY: 1,
        scaleX: 1,
        duration: 3,
        stagger: 0.02,
        ease: "none",
      });
      const riseDuration = tl.duration() - riseStart;
      tl.to(
        quote2Ref.current,
        { yPercent: 0, ease: "none", duration: riseDuration },
        riseStart
      );

      // Hold Quote 2 in place before the pin releases, so it doesn't start
      // scrolling away the moment it settles.
      tl.to({}, { duration: 3.5 });
    }, wrapperRef);

    return () => ctx.revert();
  }, [simple]);

  if (simple) {
    return (
      <section style={{ backgroundColor: CREAM }}>
        {[QUOTE_1, QUOTE_2].map((quote, i) => {
          const Tag = i === 0 ? "h1" : "h2";
          return (
            <div
              key={i}
              className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center md:px-16"
            >
              <Tag
                className={`w-full max-w-[1400px] uppercase text-center ${HEADING_SIZE_CLASS}`}
                style={{
                  fontFamily: "var(--font-agatho)",
                  fontWeight: 400,
                  lineHeight: LINE_HEIGHT,
                  color: INK,
                  textAlign: "center",
                }}
              >
                {quote}
              </Tag>
            </div>
          );
        })}
      </section>
    );
  }

  return (
    // Mobile: the pinned frame is 65svh (the quote is only ~210-250px tall),
    // and the section is frame + 35svh so pacing matches desktop.
    // home/About.jsx's mobile pull-up depends on this 65svh -- change them
    // together. Desktop: 100vh frame, 135vh section.
    <section ref={wrapperRef} className="relative w-full h-[100svh] md:h-[135vh]">
      <div
        ref={stickyRef}
        className="sticky top-0 flex h-[65svh] w-full flex-col items-center justify-center overflow-hidden px-6 md:h-[100vh] md:px-16"
        style={{ backgroundColor: CREAM }}
      >
        <div className="relative w-full min-h-[260px] max-w-[1400px] md:min-h-[220px]">
          <div
            ref={quote1Ref}
            className="absolute inset-0 flex items-center justify-center text-center"
          >
            <h1
              className={`w-full max-w-[1400px] uppercase text-center ${HEADING_SIZE_CLASS}`}
              style={{
                fontFamily: "var(--font-agatho)",
                fontWeight: 400,
                lineHeight: LINE_HEIGHT,
                textAlign: "center",
              }}
            >
              {q1Words.map((word, i) => (
                <span
                  key={i}
                  ref={(el) => {
                    if (el) q1WordsRef.current[i] = el;
                  }}
                  style={{ color: INK, opacity: MUTED_OPACITY }}
                >
                  {word}
                  {i < q1Words.length - 1 ? " " : ""}
                </span>
              ))}
            </h1>
          </div>

          <div
            ref={quote2Ref}
            className="absolute inset-0 flex items-center justify-center overflow-hidden text-center"
          >
            <h2
              className={`inline-block w-full max-w-[1400px] uppercase ${HEADING_SIZE_CLASS}`}
              style={{
                fontFamily: "var(--font-agatho)",
                fontWeight: 400,
                lineHeight: LINE_HEIGHT,
                color: INK,
                textAlign: "center",
              }}
            >
              {(() => {
                let flatIndex = 0;
                return q2Words.map((word, wi) => (
                  <Fragment key={wi}>
                    {/* nowrap stops the per-letter spans breaking mid-word. */}
                    <span style={{ whiteSpace: "nowrap" }}>
                      {word.split("").map((char) => {
                        const idx = flatIndex++;
                        return (
                          <span
                            key={idx}
                            ref={(el) => {
                              if (el) q2CharsRef.current[idx] = el;
                            }}
                            className="inline-block"
                          >
                            {char}
                          </span>
                        );
                      })}
                    </span>
                    {wi < q2Words.length - 1 ? " " : ""}
                  </Fragment>
                ));
              })()}
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}

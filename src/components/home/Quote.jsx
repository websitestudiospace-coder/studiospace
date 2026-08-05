"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const INK = "#2B2622";
const MUTED_OPACITY = 0.25;
const FONT_SIZE = "clamp(32px, 5.5vw, 58px)";

const QUOTES = [
  "Thoughtfully designed architecture and interiors, crafted around your story.",
  "Where timeless design meets the way you truly live.",
];

function shuffleGroups(count) {
  const idx = Array.from({ length: count }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }

  const groups = [];
  let i = 0;
  while (i < idx.length) {
    const size = Math.min(2 + Math.round(Math.random()), idx.length - i);
    groups.push(idx.slice(i, i + size));
    i += size;
  }
  return groups;
}

function addGroupedReveal(tl, els, groups, { innerStagger, ...vars }, position) {
  groups.forEach((group, gi) => {
    const targets = group.map((idx) => els[idx]).filter(Boolean);
    tl.to(
      targets,
      { ...vars, stagger: innerStagger, ease: "none" },
      gi === 0 ? position : "-=0.15"
    );
  });
}

function Circle({ innerRef }) {
  return (
    <span
      ref={innerRef}
      aria-hidden="true"
      className="mb-16 block shrink-0 rounded-full md:mb-20"
      style={{
        width: "clamp(48px, 5vw, 60px)",
        height: "clamp(48px, 5vw, 60px)",
        border: "1px solid rgba(43,38,34,0.4)",
      }}
    />
  );
}

function QuoteLayer({ containerRef, wordsRef, quote }) {
  const words = quote.split(" ");
  wordsRef.current = [];

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center"
    >
      <p
        className="max-w-[900px] text-center uppercase"
        style={{
          fontFamily: "var(--font-agatho)",
          fontSize: FONT_SIZE,
          lineHeight: 1.25,
        }}
      >
        {words.map((word, i) => (
          <span
            key={i}
            ref={(el) => {
              wordsRef.current[i] = el;
            }}
            style={{ color: INK, opacity: MUTED_OPACITY }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
    </div>
  );
}

export default function Quote() {
  const wrapperRef = useRef(null);
  const circleRef = useRef(null);
  const card2Ref = useRef(null);
  const q1WordsRef = useRef([]);
  const q2WordsRef = useRef([]);
  const [simple, setSimple] = useState(true);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setSimple(reduceMotion);
  }, []);

  useEffect(() => {
    if (simple) return;

    const ctx = gsap.context(() => {
      gsap.set(card2Ref.current, { opacity: 0, pointerEvents: "none" });
      gsap.set(circleRef.current, { opacity: 0, scale: 0.8 });

      ScrollTrigger.create({
        trigger: wrapperRef.current,
        start: "top 85%",
        once: true,
        onEnter: () =>
          gsap.to(circleRef.current, {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
          }),
      });

      const q1Groups = shuffleGroups(q1WordsRef.current.length);
      const q2Groups = shuffleGroups(q2WordsRef.current.length);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      addGroupedReveal(tl, q1WordsRef.current, q1Groups, {
        opacity: 1,
        duration: 0.4,
        innerStagger: 0.06,
      });

      tl.to({}, { duration: 0.5 });

      addGroupedReveal(tl, q1WordsRef.current, q1Groups, {
        opacity: MUTED_OPACITY,
        duration: 0.4,
        innerStagger: 0.05,
      });

      tl.set(card2Ref.current, { pointerEvents: "auto" });
      tl.to(card2Ref.current, { opacity: 1, duration: 0.3, ease: "none" }, "<");

      addGroupedReveal(
        tl,
        q2WordsRef.current,
        q2Groups,
        { opacity: 1, duration: 0.4, innerStagger: 0.06 },
        "<"
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, [simple]);

  if (simple) {
    return (
      <section style={{ backgroundColor: CREAM }}>
        {QUOTES.map((quote, i) => (
          <div
            key={i}
            className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center md:px-16"
          >
            <Circle />
            <p
              className="max-w-[900px] uppercase"
              style={{
                fontFamily: "var(--font-agatho)",
                fontSize: FONT_SIZE,
                lineHeight: 1.25,
                color: INK,
              }}
            >
              {quote}
            </p>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section ref={wrapperRef} className="relative w-full h-[200vh]">
      <div
        className="sticky top-0 flex h-[100vh] w-full flex-col items-center justify-center overflow-hidden px-6 md:px-16"
        style={{ backgroundColor: CREAM }}
      >
        <Circle innerRef={circleRef} />
        <div className="relative w-full min-h-[140px] max-w-[900px] md:min-h-[220px]">
          <QuoteLayer
            containerRef={null}
            wordsRef={q1WordsRef}
            quote={QUOTES[0]}
          />
          <QuoteLayer
            containerRef={card2Ref}
            wordsRef={q2WordsRef}
            quote={QUOTES[1]}
          />
        </div>
      </div>
    </section>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const CARD_BG = "rgba(43,38,34,0.04)";
const INK = "#2B2622";
const MAROON = "#6E1F24";

const DRAG_THRESHOLD = 6;
const SWIPE_RATIO = 0.18;

// TODO: placeholder press mentions -- swap in the 4 real entries (logo,
// publication, date, headline, article url) once provided.
const PRESS_ITEMS = [
  {
    publication: "Publication Name",
    date: "Month Year",
    headline: "Placeholder headline text goes here about the studio's latest work.",
    url: "#",
  },
  {
    publication: "Publication Name",
    date: "Month Year",
    headline: "Placeholder headline text describing a featured project in more detail.",
    url: "#",
  },
  {
    publication: "Publication Name",
    date: "Month Year",
    headline: "Placeholder headline text goes here for the third press mention.",
    url: "#",
  },
  {
    publication: "Publication Name",
    date: "Month Year",
    headline: "Placeholder headline text goes here for the fourth press mention.",
    url: "#",
  },
];

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M4 9H14M14 9L9.5 4.5M14 9L9.5 13.5"
        stroke={INK}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Bundled Agatho font's underscore glyph is a "buy font" watermark, not a
// real underscore (see Footer.jsx's InlineWordmark) -- draw it as a small
// decorative bar instead of relying on the font's own glyph.
function InlineWordmark({ text }) {
  return text.split("").map((char, i) =>
    char === "_" ? (
      <span
        key={i}
        aria-hidden="true"
        style={{
          display: "inline-block",
          position: "relative",
          top: "0.14em",
          width: "0.32em",
          height: "0.09em",
          backgroundColor: "currentColor",
        }}
      />
    ) : (
      char
    )
  );
}

export default function Press() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const revealRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const cardWidthRef = useRef(0);
  const indexRef = useRef(0);
  const dragRef = useRef({ dragging: false, startX: 0, baseX: 0, moved: false });
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  const goTo = useCallback((i, animate) => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;
    const clamped = Math.max(0, Math.min(PRESS_ITEMS.length - 1, i));
    const width = viewport.getBoundingClientRect().width;
    cardWidthRef.current = width;
    indexRef.current = clamped;
    setIndex(clamped);
    gsap.killTweensOf(track);
    if (animate && !reduceMotion) {
      gsap.to(track, { x: -clamped * width, duration: 0.7, ease: "power3.out" });
    } else {
      gsap.set(track, { x: -clamped * width });
    }
  }, [reduceMotion]);

  // Keep the track aligned with the current card whenever viewport width changes.
  useEffect(() => {
    const handleResize = () => goTo(indexRef.current, false);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [goTo]);

  // Drag / swipe -- gated behind a small movement threshold so a tap on the
  // arrow link inside a card still registers as a normal click instead of
  // being eaten by the drag handling.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const state = dragRef.current;

    const handlePointerDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      state.dragging = true;
      state.moved = false;
      state.startX = e.clientX;
      state.baseX = -indexRef.current * cardWidthRef.current;
      gsap.killTweensOf(track);
    };

    const handlePointerMove = (e) => {
      if (!state.dragging) return;
      const delta = e.clientX - state.startX;
      if (Math.abs(delta) > DRAG_THRESHOLD) state.moved = true;
      if (!state.moved) return;
      e.preventDefault();
      const width = cardWidthRef.current || 1;
      const min = -(PRESS_ITEMS.length - 1) * width;
      let x = state.baseX + delta;
      if (x > 0) x *= 0.35;
      if (x < min) x = min + (x - min) * 0.35;
      gsap.set(track, { x });
    };

    const handlePointerUp = (e) => {
      if (!state.dragging) return;
      state.dragging = false;
      if (!state.moved) return;
      const delta = e.clientX - state.startX;
      const width = cardWidthRef.current || 1;
      let next = indexRef.current;
      if (Math.abs(delta) > width * SWIPE_RATIO) {
        next = delta < 0 ? indexRef.current + 1 : indexRef.current - 1;
      }
      goTo(next, true);
    };

    const handleClickCapture = (e) => {
      if (state.moved) {
        e.preventDefault();
        e.stopPropagation();
        state.moved = false;
      }
    };

    track.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp);
    track.addEventListener("click", handleClickCapture, true);

    return () => {
      track.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      track.removeEventListener("click", handleClickCapture, true);
    };
  }, [goTo]);

  useEffect(() => {
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      gsap.set(headingRef.current, { opacity: 0, y: 24 });
      gsap.set(revealRef.current, { opacity: 0, y: 24 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom 65%",
          scrub: 0.5,
        },
      });

      tl.to(headingRef.current, { opacity: 1, y: 0, duration: 0.4, ease: "none" }, 0);
      tl.to(revealRef.current, { opacity: 1, y: 0, duration: 0.4, ease: "none" }, 0.35);
    }, sectionRef);

    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className="w-full px-6 py-12 md:px-16 md:py-[100px]"
      style={{ backgroundColor: CREAM }}
    >
      <div className="mx-auto w-full max-w-[720px]">
        {/* TODO: placeholder heading copy -- pending final copy approval */}
        <h2
          ref={headingRef}
          className="text-center text-3xl md:text-4xl"
          style={{ fontFamily: "var(--font-agatho)", color: INK }}
        >
          <span style={{ fontStyle: "italic" }}>
            <InlineWordmark text="SP_ACE" />
          </span>{" "}
          in Press
        </h2>

        <div ref={revealRef} className="mt-10 md:mt-14">
          <div
            ref={viewportRef}
            className="overflow-hidden"
            style={{ touchAction: "pan-y" }}
          >
            <div
              ref={trackRef}
              className="flex cursor-grab select-none active:cursor-grabbing"
            >
              {PRESS_ITEMS.map((item) => (
                <article
                  key={item.publication + item.date + item.headline}
                  className="w-full shrink-0 rounded-[28px] border p-8 md:p-12"
                  style={{ backgroundColor: CARD_BG, borderColor: "rgba(43,38,34,0.1)" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 shrink-0 rounded-full"
                        style={{ backgroundColor: "rgba(43,38,34,0.12)" }}
                        aria-hidden="true"
                      />
                      <div>
                        <p
                          className="text-sm font-bold md:text-base"
                          style={{ fontFamily: "var(--font-manrope)", color: INK }}
                        >
                          {item.publication}
                        </p>
                        <p
                          className="mt-0.5 text-xs md:text-sm"
                          style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.5 }}
                        >
                          {item.date}
                        </p>
                      </div>
                    </div>
                    <a
                      href={item.url}
                      aria-label={`Read the ${item.publication} article`}
                      className="shrink-0 rounded-full p-2.5 transition-opacity duration-300 hover:opacity-60"
                      style={{ border: "1px solid rgba(43,38,34,0.15)" }}
                    >
                      <ArrowIcon />
                    </a>
                  </div>

                  <p
                    className="mt-8 text-2xl font-bold leading-snug md:mt-10 md:text-3xl"
                    style={{ fontFamily: "var(--font-manrope)", color: INK }}
                  >
                    {item.headline}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 md:mt-10">
            {PRESS_ITEMS.map((item, i) => (
              <button
                key={item.publication + item.date + item.headline}
                type="button"
                aria-label={`Go to press item ${i + 1}`}
                aria-current={i === index}
                onClick={() => goTo(i, true)}
                className="h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: i === index ? "22px" : "10px",
                  backgroundColor: i === index ? MAROON : "rgba(43,38,34,0.2)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

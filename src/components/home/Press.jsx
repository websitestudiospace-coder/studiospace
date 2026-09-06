"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "@/components/ui/Button";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const CARD_BG = "rgba(43,38,34,0.04)";
const INK = "#2B2622";
const MAROON = "#6E1F24";

const DRAG_THRESHOLD = 6;
const SWIPE_RATIO = 0.18;

// Real press mentions, most recent first (per the client's brief). Publish
// dates for the first 4 are TODOs -- this environment's WebFetch can't reach
// architectureplusdesign.in or architecturaldigest.in (both return "unable to
// fetch"), so rather than guess a month/year, those are left flagged for
// whoever can confirm them (check the article's own byline/dateline).
const PRESS_ITEMS = [
  {
    publication: "Architecture+Design",
    // TODO: unconfirmed publish date -- WebFetch couldn't reach
    // architectureplusdesign.in from this environment. Confirm from the
    // article's own byline before shipping.
    date: "Date TBC",
    headline:
      "The Modern Organic Home by Studio SP_ACE functions as the truest kind of medicine — a space built entirely around stillness",
    url: "https://www.architectureplusdesign.in/architecture/the-modern-organic-home-by-studio-sp_ace-functions-as-the-truest-kind-of-medicine-a-space-built-entirely-around-stillness/",
  },
  {
    publication: "Architectural Digest India",
    // TODO: unconfirmed publish date -- WebFetch couldn't reach
    // architecturaldigest.in from this environment. Confirm from the
    // article's own byline before shipping.
    date: "Date TBC",
    headline: "This builder-grade apartment in Bengaluru is transformed into an oasis of zen",
    url: "https://www.architecturaldigest.in/story/this-builder-grade-apartment-in-bengaluru-is-transformed-into-an-oasis-of-zen-studio-sp-ace/",
  },
  {
    publication: "Architectural Digest India",
    // TODO: unconfirmed publish date -- see note above.
    date: "Date TBC",
    headline: "In this Bengaluru apartment, wanderlust and heritage are woven into the design",
    url: "https://www.architecturaldigest.in/story/in-this-bengaluru-apartment-wanderlust-and-heritage-are-woven-into-the-design-studio-space/",
  },
  {
    publication: "Architectural Digest India",
    // TODO: unconfirmed publish date -- see note above.
    date: "Date TBC",
    headline: "This Hyderabad home echoes timeless Indian design for a modern family",
    // Tracking query params (?utm_source=...) stripped per the brief.
    url: "https://www.architecturaldigest.in/story/this-hyderabad-home-echoes-timeless-indian-design-for-a-modern-family/",
  },
  {
    publication: "Elle Decor",
    date: "December 2023",
    headline:
      "A hymn of teak wood and cane: Studio SP_ACE conjures up a modern eclectic home at the edge of Bengaluru's Turahalli Forest",
    url: "https://elledecor.in/hymn-teak-wood-cane-studio-sp_ace-conjures-modern-eclectic-home-edge-bangalores-turahalli-forest/",
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

function PressHeading({ headingRef }) {
  return (
    // TODO: placeholder heading copy -- pending final copy approval
    <h2
      ref={headingRef}
      className="text-center text-[32px] md:text-[48px]"
      style={{ fontFamily: "var(--font-agatho)", color: INK }}
    >
      Studio{" "}
      <span style={{ fontStyle: "italic" }}>
        <InlineWordmark text="SP_ACE" />
      </span>{" "}
      in Press
    </h2>
  );
}

function PressCarousel({
  revealRef,
  viewportRef,
  trackRef,
  index,
  goTo,
}) {
  return (
    <div ref={revealRef} className="mt-10 md:mt-14">
      <div ref={viewportRef} className="overflow-hidden" style={{ touchAction: "pan-y" }}>
        <div ref={trackRef} className="flex cursor-grab select-none active:cursor-grabbing">
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
                      style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.65 }}
                    >
                      {item.date}
                    </p>
                  </div>
                </div>
                <Button
                  href={item.url}
                  variant="icon"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Read the ${item.publication} article`}
                >
                  <ArrowIcon />
                </Button>
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
            className="flex h-11 w-11 items-center justify-center"
          >
            <span
              className="h-2.5 rounded-full transition-all duration-300"
              style={{
                width: i === index ? "22px" : "10px",
                backgroundColor: i === index ? MAROON : "rgba(43,38,34,0.2)",
              }}
            />
          </button>
        ))}
      </div>
    </div>
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
  const reduceMotion = useReducedMotion();

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

  // One-shot reveal (not scroll-scrubbed): this section doesn't need to
  // feel scroll-locked, so it just plays once as it enters the viewport.
  // Still waits for "preloader:complete" since "top 80%" is calculated
  // against this section's own position, which depends on every section
  // above it already being in its final, settled layout.
  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        gsap.set(headingRef.current, { opacity: 0, y: 24 });
        gsap.set(revealRef.current, { opacity: 0, y: 24 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });

        tl.to(headingRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0);
        tl.to(revealRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.15);
      }, sectionRef);

      return () => ctx.revert();
    },
    [],
    !reduceMotion
  );

  return (
    <section
      id="press"
      ref={sectionRef}
      className="w-full px-6 py-12 md:px-16 md:py-24"
      style={{ backgroundColor: CREAM }}
    >
      <div className="mx-auto w-full max-w-[1100px]">
        <PressHeading headingRef={headingRef} />
        <PressCarousel
          revealRef={revealRef}
          viewportRef={viewportRef}
          trackRef={trackRef}
          index={index}
          goTo={goTo}
        />
      </div>
    </section>
  );
}

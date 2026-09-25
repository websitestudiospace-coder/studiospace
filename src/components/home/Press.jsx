"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "@/components/ui/Button";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";
import InlineWordmark from "@/components/ui/InlineWordmark";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const CARD_BG = "rgba(43,38,34,0.04)";
const INK = "#2B2622";
const MAROON = "#6E1F24";

const DRAG_THRESHOLD = 6;
const SWIPE_RATIO = 0.18;

// Auto-advance timing: how often the carousel moves on its own, and how
// long it waits after the visitor's last drag/hover/dot-click before
// resuming.
const AUTO_ADVANCE_MS = 5000;
const RESUME_IDLE_MS = 2000;

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

// Derives the outlet's bare domain from its article URL (strips "www."),
// used to request that outlet's real favicon rather than a generic logo.
function getDomain(pageUrl) {
  try {
    return new URL(pageUrl).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

// Real favicon per outlet, via Google's zero-maintenance favicon service --
// no stated preference in brain.md for self-hosted logo assets, and this
// avoids storing/maintaining 5 external brand logos as project assets.
// Falls back to the original plain gray circle if the favicon fails to
// load, so one broken/blocked domain never breaks a card's layout.
function OutletAvatar({ publication, url }) {
  const [failed, setFailed] = useState(false);
  const domain = getDomain(url);

  if (failed || !domain) {
    return (
      <div
        className="h-10 w-10 shrink-0 rounded-full"
        style={{ backgroundColor: "rgba(43,38,34,0.12)" }}
        aria-hidden="true"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- external favicon service, not project-hosted media
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
      alt={`${publication} logo`}
      width={40}
      height={40}
      className="h-10 w-10 shrink-0 rounded-full object-contain"
      style={{ backgroundColor: "rgba(43,38,34,0.12)" }}
      onError={() => setFailed(true)}
    />
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
  items,
  revealRef,
  viewportRef,
  trackRef,
  index,
  onDotClick,
  onHoverEnter,
  onHoverLeave,
}) {
  return (
    <div ref={revealRef} className="mt-10 md:mt-14">
      <div
        ref={viewportRef}
        className="overflow-hidden"
        style={{ touchAction: "pan-y" }}
        onPointerEnter={onHoverEnter}
        onPointerLeave={onHoverLeave}
      >
        <div ref={trackRef} className="flex cursor-grab select-none active:cursor-grabbing">
          {items.map((item) => (
            <article
              key={item.publication + item.date + item.headline}
              className="w-full shrink-0 rounded-[28px] border p-8 md:p-12"
              style={{ backgroundColor: CARD_BG, borderColor: "rgba(43,38,34,0.1)" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <OutletAvatar publication={item.publication} url={item.url} />
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

      <div className="mt-8 flex items-center justify-center md:mt-10">
        {items.map((item, i) => (
          <button
            key={item.publication + item.date + item.headline}
            type="button"
            aria-label={`Go to press item ${i + 1}`}
            aria-current={i === index}
            onClick={() => onDotClick(i)}
            // A fixed 44x44 tap box (the touch-target guideline) around the
            // unchanged visible dot. The row has no gap: the boxes' own
            // padding already spaces the dots out.
            className="flex h-11 min-w-11 items-center justify-center"
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

export default function Press({ items }) {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const revealRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const cardWidthRef = useRef(0);
  const indexRef = useRef(0);
  const dragRef = useRef({ dragging: false, startX: 0, baseX: 0, moved: false });
  const hoveringRef = useRef(false);
  const lastInteractionRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [inView, setInView] = useState(false);
  const reduceMotion = useReducedMotion();

  const goTo = useCallback((i, animate) => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;
    const clamped = Math.max(0, Math.min(items.length - 1, i));
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
  }, [items.length, reduceMotion]);

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
      lastInteractionRef.current = Date.now();
      gsap.killTweensOf(track);
    };

    const handlePointerMove = (e) => {
      if (!state.dragging) return;
      const delta = e.clientX - state.startX;
      if (Math.abs(delta) > DRAG_THRESHOLD) state.moved = true;
      if (!state.moved) return;
      e.preventDefault();
      const width = cardWidthRef.current || 1;
      const min = -(items.length - 1) * width;
      let x = state.baseX + delta;
      if (x > 0) x *= 0.35;
      if (x < min) x = min + (x - min) * 0.35;
      gsap.set(track, { x });
    };

    const handlePointerUp = (e) => {
      if (!state.dragging) return;
      state.dragging = false;
      lastInteractionRef.current = Date.now();
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

  // Real mouse hover only -- a touch tap fires an emulated mouseenter with
  // no matching mouseleave on most mobile browsers, which would leave
  // hoveringRef stuck true and pause auto-advance for good after one tap.
  const handleHoverEnter = useCallback((e) => {
    if (e.pointerType !== "mouse") return;
    hoveringRef.current = true;
    lastInteractionRef.current = Date.now();
  }, []);

  const handleHoverLeave = useCallback(() => {
    hoveringRef.current = false;
    lastInteractionRef.current = Date.now();
  }, []);

  const handleDotClick = useCallback(
    (i) => {
      lastInteractionRef.current = Date.now();
      goTo(i, true);
    },
    [goTo]
  );

  // Tracks whether the carousel is actually on-screen, so the auto-advance
  // timer below doesn't keep silently ticking (and fighting scroll restore)
  // while this section is scrolled out of view.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Auto-advance, loops back to the first item after the last. Disabled
  // entirely under prefers-reduced-motion or while off-screen; paused while
  // the visitor is dragging/hovering or shortly after their last dot click.
  useEffect(() => {
    if (reduceMotion || !inView) return;
    const id = setInterval(() => {
      if (hoveringRef.current || dragRef.current.dragging) return;
      if (Date.now() - lastInteractionRef.current < RESUME_IDLE_MS) return;
      goTo((indexRef.current + 1) % items.length, true);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [reduceMotion, inView, goTo]);

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
          items={items}
          revealRef={revealRef}
          viewportRef={viewportRef}
          trackRef={trackRef}
          index={index}
          onDotClick={handleDotClick}
          onHoverEnter={handleHoverEnter}
          onHoverLeave={handleHoverLeave}
        />
      </div>
    </section>
  );
}

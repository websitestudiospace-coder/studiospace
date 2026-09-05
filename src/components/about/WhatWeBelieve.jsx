"use client";

import { useEffect, useRef, useState } from "react";
import { getLenis } from "@/lib/lenis";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";

const CREAM = "#F7EFE4";
const CARD_SURFACE = "#FBF6EE";
const INK = "#2B2622";
const MAROON = "#6E1F24";

const HEADING = "What We Believe";

// TODO: placeholder principles -- swap in the client's real 4 belief
// statements once provided. Structure/styling below is final.
const BELIEFS = [
  {
    title: "Honest Materials",
    body: "More on our approach to material selection is on its way.",
  },
  {
    title: "Considered Detail",
    body: "More on our attention to detail is on its way.",
  },
  {
    title: "Timeless Design",
    body: "More on our design philosophy is on its way.",
  },
  {
    title: "Client-Centered Process",
    body: "More on our collaborative process is on its way.",
  },
];

// Fourth rebuild: a scroll-pinned image+text card stack (React Bits'
// "ScrollStack" pattern), adapted rather than ported verbatim -- the
// reference creates its own Lenis instance for window-scroll mode, which
// this project can't do (one shared Lenis instance for the whole page,
// created in SmoothScroll.jsx; a second instance would fight it for the
// same window scroll). Instead this subscribes to that shared instance via
// src/lib/lenis.js. The reference's own transform math (translateY/scale
// from scroll position, applied as direct style writes, not GSAP tweens)
// is reimplemented here rather than copied blind, tuned for 4 cards at
// this page's own content width -- rotationAmount and blurAmount are both
// omitted entirely (not just zeroed): this site's motion vocabulary
// doesn't use rotation or blur anywhere, and the reference's own defaults
// for a demo with many more cards didn't fit 4.
//
// Cards pin via `position: sticky` (this site's locked convention -- never
// GSAP's `pin: true`, and this pattern doesn't use GSAP's pin either), and
// nothing here is also an independent ScrollTrigger target elsewhere on
// the page, so the golden rule holds even though the stacking transforms
// themselves are manual scroll math rather than GSAP.
//
// Real project photography now illustrates each belief (passed down as
// `beliefImages` from about/page.js, a server component -- getProjectPhoto()
// in src/lib/projects.js reads the filesystem via Node's `fs`, which can't
// run inside this "use client" component, so the resolved Cloudinary URLs
// arrive as a plain prop instead).

// Desktop scroll budget per card (vh) before the next one takes over, plus
// a trailing hold on the last card so it doesn't release the instant it
// settles. Shorter on mobile, matching every other pinned sequence on this
// site (Quote/MeetFounders/the old WhatWeBelieve stack all shorten their
// scroll distance on mobile) so the mechanic doesn't feel endless on a
// small screen.
const ITEM_DISTANCE_VH_DESKTOP = 85;
const ITEM_DISTANCE_VH_MOBILE = 60;
const TRAILING_HOLD_VH_DESKTOP = 45;
const TRAILING_HOLD_VH_MOBILE = 25;

// A card enters from this far below (px) and this much smaller, settling
// to y:0/scale:1 as it becomes current.
const ENTER_OFFSET_PX = 80;
const ENTER_SCALE = 0.92;
// Once superseded, a card recedes into the stack behind newer ones: each
// further card that arrives pushes it up (itemStackDistance) and shrinks
// it a little more (itemScale), capped so old cards don't vanish.
const STACK_OFFSET_PX = 26;
const ITEM_SCALE_STEP = 0.05;
const MAX_STACK_DEPTH = BELIEFS.length - 1;

const clamp01 = (v) => Math.max(0, Math.min(1, v));

// Pure function of the continuous progress value `x` (0..BELIEFS.length)
// and a card's own index -- returns the opacity/y/scale/zIndex to apply.
// Kept as one function (not scattered across the update loop) so the
// desktop and mobile card sets below can share the exact same math.
function getCardStyle(x, index) {
  const local = x - index;

  if (local <= 0) {
    return { opacity: 0, y: ENTER_OFFSET_PX, scale: ENTER_SCALE, zIndex: index };
  }
  if (local <= 1) {
    const t = local;
    return {
      opacity: t,
      y: ENTER_OFFSET_PX * (1 - t),
      scale: ENTER_SCALE + (1 - ENTER_SCALE) * t,
      zIndex: index,
    };
  }
  const depth = Math.min(local - 1, MAX_STACK_DEPTH);
  // Opacity has to collapse much faster than position/scale here. A first
  // pass faded all three together (opacity 1 - depth*0.06) and, confirmed
  // via screenshot, produced a sustained garbled overlap: `depth` and the
  // NEXT card's own arrival-`local` are numerically identical during the
  // handoff (both equal x - index - 1), so a slow opacity falloff meant
  // this card stayed near-fully-opaque for this card's ENTIRE arrival --
  // two cards' text legible on top of each other for a full unit of
  // scroll, not a brief blend. Collapsing to 0 by depth 0.2 (a fifth of
  // that same distance) keeps the crossfade brief enough that only a
  // short blend is ever visible, while position/scale keep easing across
  // the full stack depth so receded cards still read as a visible pile.
  // A 0.08 floor (tried first) still let 2-3 stacked-behind cards'
  // ghosted text combine into a genuinely readable palimpsest once several
  // had accumulated -- confirmed via screenshot at a settled scroll
  // position, not just the transitional blend this was meant to allow.
  // Full 0 instead, same as how Quote.jsx sets `visibility: hidden` on its
  // own receded quote before the next one appears -- this codebase's own
  // established way of guaranteeing zero overlap risk rather than a faint
  // trace that can still stack up. The visible "pile" cue comes from the
  // position/scale easing below instead (still applied over the full
  // depth), not from lingering ghost text.
  const textOpacity = depth >= 0.2 ? 0 : 1 - depth / 0.2;
  return {
    opacity: textOpacity,
    y: -depth * STACK_OFFSET_PX,
    scale: 1 - depth * ITEM_SCALE_STEP,
    zIndex: index,
  };
}

function NumberBadge({ index }) {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm"
      style={{ backgroundColor: MAROON, color: CREAM, fontFamily: "var(--font-manrope)" }}
    >
      {String(index + 1).padStart(2, "0")}
    </div>
  );
}

function StackCard({ index, belief, image, cardRef }) {
  return (
    <div
      ref={cardRef}
      className="[grid-area:1/1] flex w-full flex-col overflow-hidden rounded-[28px] border md:h-[420px] md:flex-row"
      style={{
        backgroundColor: CARD_SURFACE,
        borderColor: "rgba(43,38,34,0.1)",
        boxShadow: "0 20px 50px rgba(43,38,34,0.14)",
        willChange: "transform, opacity",
      }}
    >
      <div className="relative h-56 w-full shrink-0 md:h-full md:w-1/2">
        {image?.src && (
          // Plain <img>, not next/image -- the resolved Cloudinary URL
          // arrives fully-formed as a prop from about/page.js (see the
          // file-level comment above), and next/image would additionally
          // require res.cloudinary.com in next.config.js's remotePatterns
          // (confirmed via a live "Invalid src prop" crash) -- a config
          // change outside this task's scoped file list. Every other
          // Cloudinary image on this site goes through CldImage instead,
          // which sidesteps that requirement; this component intentionally
          // doesn't need CldImage's own server-side resolution since the
          // URL is already resolved by the time it gets here.
          <img
            src={image.src}
            alt={image.alt || belief.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col justify-center p-7 md:p-10">
        <NumberBadge index={index} />
        <h3
          className="mt-5 text-xl md:text-2xl"
          style={{ fontFamily: "var(--font-agatho)", color: INK }}
        >
          {belief.title}
        </h3>
        <p
          className="mt-3 text-sm md:text-base"
          style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.65 }}
        >
          {belief.body}
        </p>
      </div>
    </div>
  );
}

function StaticCard({ index, belief, image }) {
  return (
    <div
      className="flex w-full flex-col overflow-hidden rounded-[28px] border md:flex-row"
      style={{
        backgroundColor: CARD_SURFACE,
        borderColor: "rgba(43,38,34,0.1)",
        boxShadow: "0 4px 20px rgba(43,38,34,0.05)",
      }}
    >
      <div className="relative h-56 w-full shrink-0 md:h-auto md:w-1/2">
        {image?.src && (
          // Plain <img>, not next/image -- the resolved Cloudinary URL
          // arrives fully-formed as a prop from about/page.js (see the
          // file-level comment above), and next/image would additionally
          // require res.cloudinary.com in next.config.js's remotePatterns
          // (confirmed via a live "Invalid src prop" crash) -- a config
          // change outside this task's scoped file list. Every other
          // Cloudinary image on this site goes through CldImage instead,
          // which sidesteps that requirement; this component intentionally
          // doesn't need CldImage's own server-side resolution since the
          // URL is already resolved by the time it gets here.
          <img
            src={image.src}
            alt={image.alt || belief.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col justify-center p-7 md:p-10">
        <NumberBadge index={index} />
        <h3
          className="mt-5 text-xl md:text-2xl"
          style={{ fontFamily: "var(--font-agatho)", color: INK }}
        >
          {belief.title}
        </h3>
        <p
          className="mt-3 text-sm md:text-base"
          style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.65 }}
        >
          {belief.body}
        </p>
      </div>
    </div>
  );
}

export default function WhatWeBelieve({ beliefImages = [] }) {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);
  // `initial = true` -- the same fix documented at length in
  // PROJECT_STATUS.md for the prior WhatWeBelieve rebuilds: starting
  // `false` lets the gated effect below briefly run with a stale value
  // before matchMedia resolves, which (for a GSAP-based effect) leaves
  // content permanently invisible under reduced motion. This effect isn't
  // GSAP, but starting `true` is still correct here for the same first-
  // paint-flash reason Quote.jsx originally adopted it for.
  const reduceMotion = useReducedMotion(true);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  usePreloaderGate(
    () => {
      const cards = cardRefs.current.filter(Boolean);
      if (cards.length !== BELIEFS.length) return undefined;

      const itemDistanceVh = isDesktop ? ITEM_DISTANCE_VH_DESKTOP : ITEM_DISTANCE_VH_MOBILE;
      const trailingHoldVh = isDesktop ? TRAILING_HOLD_VH_DESKTOP : TRAILING_HOLD_VH_MOBILE;
      const activeVh = BELIEFS.length * itemDistanceVh;
      const totalVh = activeVh + trailingHoldVh;
      const activeFraction = activeVh / totalVh;

      const update = () => {
        const section = sectionRef.current;
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const scrollableHeight = rect.height - window.innerHeight;
        const scrolled = clamp01(scrollableHeight > 0 ? -rect.top / scrollableHeight : 0);
        const x = Math.min(scrolled / activeFraction, 1) * BELIEFS.length;

        cards.forEach((card, i) => {
          const { opacity, y, scale, zIndex } = getCardStyle(x, i);
          card.style.opacity = String(opacity);
          card.style.transform = `translateY(${y}px) scale(${scale})`;
          card.style.zIndex = String(zIndex);
          card.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
        });
      };

      update();

      const lenis = getLenis();
      if (lenis) {
        lenis.on("scroll", update);
      } else {
        // Defensive fallback only -- in normal operation SmoothScroll's
        // effect has already registered the shared instance by the time
        // this gated effect runs (usePreloaderGate waits for
        // "preloader:complete", which fires well after mount). Never
        // creates a second Lenis instance either way.
        window.addEventListener("scroll", update, { passive: true });
      }
      window.addEventListener("resize", update);

      return () => {
        if (lenis) {
          lenis.off("scroll", update);
        } else {
          window.removeEventListener("scroll", update);
        }
        window.removeEventListener("resize", update);
      };
    },
    [isDesktop],
    !reduceMotion
  );

  if (reduceMotion) {
    return (
      <section
        className="w-full px-6 py-16 md:px-16 md:py-24"
        style={{ backgroundColor: CREAM }}
      >
        <div className="mx-auto w-full max-w-[1100px]">
          <h2
            className="text-center text-[36px] md:text-[64px]"
            style={{ fontFamily: "var(--font-agatho)", color: INK }}
          >
            {HEADING}
          </h2>
          <div className="mt-14 flex flex-col gap-8 md:mt-20">
            {BELIEFS.map((belief, i) => (
              <StaticCard key={belief.title} index={i} belief={belief} image={beliefImages[i]} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const itemDistanceVh = isDesktop ? ITEM_DISTANCE_VH_DESKTOP : ITEM_DISTANCE_VH_MOBILE;
  const trailingHoldVh = isDesktop ? TRAILING_HOLD_VH_DESKTOP : TRAILING_HOLD_VH_MOBILE;
  const totalVh = BELIEFS.length * itemDistanceVh + trailingHoldVh;

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ backgroundColor: CREAM, height: `${totalVh}vh` }}
    >
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden px-6 md:px-16">
        <h2
          className="mb-10 text-center text-[32px] md:mb-14 md:text-[48px]"
          style={{ fontFamily: "var(--font-agatho)", color: INK }}
        >
          {HEADING}
        </h2>

        <div className="grid w-full max-w-[820px]">
          {BELIEFS.map((belief, i) => (
            <StackCard
              key={belief.title}
              index={i}
              belief={belief}
              image={beliefImages[i]}
              cardRef={(el) => (cardRefs.current[i] = el)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

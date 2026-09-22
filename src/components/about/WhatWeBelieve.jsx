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

// The client's real "SP_ACE Way" -- 6 points, replacing the 4 placeholder
// titles/bodies this section shipped with. Every downstream calculation in
// this file (stack depth, scroll length, card count) already derives from
// BELIEFS.length rather than a hardcoded 4, so this array is the only thing
// that needed to change.
const BELIEFS = [
  {
    title: "Personal, Always",
    body: "We start by getting to know the people and purpose behind a project. Their stories, habits, interests, and needs become part of the design from the very beginning.",
  },
  {
    title: "Design Meets Detail",
    body: "We look at a project from the big picture down to the smallest detail. Every material, proportion, finish, and detail is considered as part of the whole.",
  },
  {
    title: "No One-Size-Fits-All",
    body: "We approach every project with a fresh perspective. Different people, places, and requirements call for different ideas, rather than a fixed SP_ACE formula.",
  },
  {
    title: "A Little Unexpected",
    body: "We like to bring in something unexpected — a colour, material, detail, or idea that gives a project its own personality without feeling forced.",
  },
  {
    title: "Making Ideas Work",
    body: "We enjoy the process of taking an idea from paper to reality. When something gets complicated on site, we look for creative ways to make the original thought work.",
  },
  {
    title: "Enough, Not Too Much",
    body: "We believe in knowing when to stop. We layer spaces thoughtfully, giving every element room to work without letting too many things compete for attention.",
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
// is reimplemented here rather than copied blind, tuned for this page's own
// content width -- rotationAmount and blurAmount are both omitted entirely
// (not just zeroed): this site's motion vocabulary doesn't use rotation or
// blur anywhere, and the reference's own defaults for a demo with many more
// cards didn't fit this page's card count.
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
//
// Scaled down ~20% alongside the card-size reduction below (85/45/60/25 ->
// 70/35/50/20): a smaller card is a smaller visual "move" per transition,
// so the old scroll budget started to feel like it was taking longer than
// the motion on screen justified. Same ratio between DISTANCE and
// TRAILING_HOLD preserved in both tiers -- only the absolute pacing changed.
const ITEM_DISTANCE_VH_DESKTOP = 70;
const ITEM_DISTANCE_VH_MOBILE = 50;
const TRAILING_HOLD_VH_DESKTOP = 35;
const TRAILING_HOLD_VH_MOBILE = 20;

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
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs"
      style={{ backgroundColor: MAROON, color: CREAM, fontFamily: "var(--font-manrope)" }}
    >
      {String(index + 1).padStart(2, "0")}
    </div>
  );
}

// Shared between StackCard and StaticCard -- the two only ever differed in
// their outer wrapper (ref/grid-area/willChange/shadow depth for the
// animated stack vs. a plain block with a lighter shadow for the reduced-
// motion list), never in this inner layout, so duplicating it twice was
// pure copy-paste risk. Redesigned per client feedback that the original
// 50/50 split + dead-centered, same-weight text read as flat and generic:
//
// - Photo now takes ~58% of the card's width (was 50%) -- 5 of the 6 real
//   belief photos are portrait-cropped source images (confirmed against
//   scripts/photo-manifest.json: ratios 0.664-0.745, only IMG_1380.webp is
//   landscape at 1.499), so a wider, narrower photo panel both reads as
//   more dominant AND crops those portraits less aggressively than the old
//   near-square box did. Still `object-cover` (never distorts, only crops)
//   -- confirmed real ratios before touching this, per the brief.
// - A soft ink-tinted gradient sits over the photo's seam edge (bottom on
//   mobile where the panels stack, right on desktop where they sit side by
//   side -- `isDesktop` is already tracked by the parent for the scroll
//   math, reused here rather than fighting Tailwind's responsive classes
//   against an inline style) so the transition into the text panel reads
//   as a deliberate edge treatment, not a hard crop meeting a flat box.
// - A short maroon rule sits between the number badge and the heading,
//   and the heading itself is bumped up a full step relative to the body
//   (text-xl/2xl -> text-2xl/3xl) with tighter vertical rhythm throughout
//   -- together these give the text panel a clearer badge -> title -> body
//   hierarchy instead of three same-weight lines floating in whitespace.
//
// Card scaled down ~20% across the board per client feedback that the
// premium-redesign card read as too large/dominant in the viewport --
// every internal measurement below (padding, badge, rule, heading, body
// margins) was scaled down together with the outer card dimensions in
// StackCard/StaticCard, not just the outer box, so the card reads as
// genuinely smaller rather than the same content cramped into a smaller
// frame. Photo panel width stays a `%` (58%) and height stays `md:h-full`,
// so it scales automatically with the outer card and keeps the exact same
// aspect ratio -- crop severity on the 5 portrait-cropped belief photos
// (ratios 0.664-0.745, see the proportion note above) is unchanged.
function CardBody({ index, belief, image, isDesktop }) {
  return (
    <>
      <div className="relative h-52 w-full shrink-0 md:h-full md:w-[58%]">
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
        {/* Seam vignette -- a sibling on top of the img (same absolute
            stacking level, later in DOM order), not an inset box-shadow on
            this relative parent, which would paint BEHIND the img's own
            absolutely-positioned box and never actually be visible. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: isDesktop
              ? "linear-gradient(to right, transparent 60%, rgba(43,38,34,0.22) 100%)"
              : "linear-gradient(to bottom, transparent 60%, rgba(43,38,34,0.22) 100%)",
          }}
        />
      </div>
      <div className="flex flex-1 flex-col justify-center p-5 md:p-8">
        <NumberBadge index={index} />
        <div className="mt-3 h-[2px] w-8" style={{ backgroundColor: MAROON }} aria-hidden="true" />
        <h3
          className="mt-3 text-xl md:text-2xl"
          style={{ fontFamily: "var(--font-agatho)", color: INK }}
        >
          {belief.title}
        </h3>
        <p
          className="mt-2 text-sm"
          style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.65 }}
        >
          {belief.body}
        </p>
      </div>
    </>
  );
}

function StackCard({ index, belief, image, isDesktop, cardRef }) {
  return (
    <div
      ref={cardRef}
      className="[grid-area:1/1] flex w-full flex-col overflow-hidden rounded-[22px] border md:h-[360px] md:flex-row"
      style={{
        backgroundColor: CARD_SURFACE,
        borderColor: "rgba(43,38,34,0.14)",
        // Two layers -- a tight, close contact shadow plus a deeper, more
        // diffuse one -- rather than the original single flat shadow. Reads
        // as the card actually sitting elevated above the page rather than
        // just having a blur under it; still soft/diffuse, not heavy.
        boxShadow: "0 2px 6px rgba(43,38,34,0.08), 0 28px 60px rgba(43,38,34,0.2)",
        willChange: "transform, opacity",
      }}
    >
      <CardBody index={index} belief={belief} image={image} isDesktop={isDesktop} />
    </div>
  );
}

function StaticCard({ index, belief, image, isDesktop }) {
  return (
    <div
      className="flex w-full flex-col overflow-hidden rounded-[22px] border md:h-[360px] md:flex-row"
      style={{
        backgroundColor: CARD_SURFACE,
        borderColor: "rgba(43,38,34,0.14)",
        boxShadow: "0 8px 24px rgba(43,38,34,0.09)",
      }}
    >
      <CardBody index={index} belief={belief} image={image} isDesktop={isDesktop} />
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
            className="text-center text-[32px] md:text-[48px]"
            style={{ fontFamily: "var(--font-agatho)", color: INK }}
          >
            {HEADING}
          </h2>
          <div className="mx-auto mt-14 flex w-full max-w-[640px] flex-col gap-8 md:mt-20">
            {BELIEFS.map((belief, i) => (
              <StaticCard
                key={belief.title}
                index={i}
                belief={belief}
                image={beliefImages[i]}
                isDesktop={isDesktop}
              />
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

        <div className="grid w-full max-w-[640px]">
          {BELIEFS.map((belief, i) => (
            <StackCard
              key={belief.title}
              index={i}
              belief={belief}
              image={beliefImages[i]}
              isDesktop={isDesktop}
              cardRef={(el) => (cardRefs.current[i] = el)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

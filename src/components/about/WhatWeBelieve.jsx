"use client";

import { Fragment, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
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

// Sticky-stack geometry. Two breakpoints only (mobile / md+, matching the
// site's one responsive cutoff everywhere else) -- values live as plain
// constants and are threaded into each card via CSS custom properties (see
// the JSX below) rather than a JS matchMedia/isDesktop hook, since nothing
// here needs to *know* the breakpoint in JS -- only the rendered `top`/
// `height` need to differ, which plain responsive CSS already does without
// adding another render-affecting state hook to this component.

// Clears the fixed Nav bar plus breathing room -- same reasoning and same
// desktop value as MeetFounders.jsx's STICKY_COLUMN_TOP_PX (Nav is ~104px
// tall at md: logo md:h-[72px] + py-4/16px top+bottom, +24px breathing).
// Mobile's bar is shorter (logo h-16/64px + py-4/32px = ~96px) so needs
// less clearance.
const NAV_CLEARANCE_MOBILE_PX = 96;
const NAV_CLEARANCE_DESKTOP_PX = 128;

// Per-card increment to the sticky `top` offset -- this is what leaves a
// sliver of each covered card visible above the one that piles on top of
// it (the sliver height is exactly this increment: card i-1's own sticky
// position is `this` less than card i's, so card i's top edge lands `this`
// many px below card i-1's, exposing exactly that strip of card i-1).
//
// NOT the literal 12px a first pass at this suggested: BeliefCard keeps its
// existing padding (p-7/28px mobile, p-8/32px desktop) ahead of the
// NumberBadge (h-11/44px mobile, h-12/48px desktop) -- per the brief,
// neither is allowed to change ("do not redesign the cards"). A 12px sliver
// would land entirely inside that top padding and show nothing but blank
// card surface. These values clear the padding and expose a real slice of
// the badge itself (desktop: 32px padding + 24px of the 48px badge; mobile:
// 28px padding + 8px of the 44px badge) -- the closest this layout can get
// to "badge stays in the sliver" without touching the card's own geometry.
const STACK_STEP_MOBILE_PX = 36;
const STACK_STEP_DESKTOP_PX = 56;

// Scroll length reserved per card -- total stack height is implicitly
// BELIEFS.length * this (plus the trailing hold below), never a separate
// hardcoded total, so adding/removing a belief automatically grows or
// shrinks the whole sequence. Shorter on mobile per the brief ("tighten...
// so the sequence doesn't feel endless on a small screen").
const PER_CARD_SCROLL_VH_MOBILE = 60;
const PER_CARD_SCROLL_VH_DESKTOP = 85;

// Extra scroll reserved only on the LAST card so it has a real dwell before
// the stack releases into IndiaMap, rather than the hold and the release
// landing on the same scroll position -- same "trailing hold" reasoning as
// every other pinned sequence on this site (Quote, AboutHero, Projects,
// MeetFounders' wordmark).
const LAST_CARD_HOLD_VH_MOBILE = 20;
const LAST_CARD_HOLD_VH_DESKTOP = 30;

// How far a covered card scales/dims down -- subtle on purpose, this is a
// depth cue, not a dismissal.
const STACK_COVERED_SCALE = 0.96;
const STACK_COVERED_OPACITY = 0.85;

// Fraction of the COVERING card's own scroll range spent scrubbing the
// PREVIOUS card down to its covered state -- short and near the start,
// since the actual pile-up (the sticky `top` handoff) is a CSS-driven
// snap, not a scroll-scrubbed slide. The remaining (1 - this) of the range
// is a hold at the covered state, same anchor-to-1-unit idiom as every
// other multi-phase timeline on this site (About.jsx, Projects.jsx,
// AboutHero.jsx).
const STACK_COVER_FRACTION = 0.15;

// Numbered circle badge -- maroon fill, cream numeral -- replaces the old
// "01/02/03/04" plain-text accent label. Keeping both would be redundant
// (spec explicitly calls that out): this is the one place the point's index
// shows up now.
function NumberBadge({ index }) {
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm md:h-12 md:w-12 md:text-base"
      style={{ backgroundColor: MAROON, color: CREAM, fontFamily: "var(--font-manrope)" }}
    >
      {String(index + 1).padStart(2, "0")}
    </div>
  );
}

// One card in the sticky stack (or the reduced-motion plain list). Visual
// style is unchanged from the old horizontal-row version -- light cream
// tint (distinct from the section's own CREAM) plus a hairline border and
// soft shadow, same radius/padding/badge/type. Width now spans the section's
// established content width (the same max-w-[1100px] container IndiaMap and
// StudioDescription also use, and that this section's own wrapper already
// applies below) instead of the old 260/300/320px-then-560px values, all of
// which were sized for a narrower focal element (three-across in the old
// horizontal row, then a single centered card) and left an unstyled-looking
// gap of bare section background beside the stack once cards stopped
// sitting edge-to-edge with each other or the viewport.
function BeliefCard({ index, belief, cardRef }) {
  return (
    <div
      ref={cardRef}
      className="w-full rounded-2xl border p-7 md:p-8"
      style={{
        backgroundColor: "#FBF6EE",
        borderColor: "rgba(43,38,34,0.1)",
        boxShadow: "0 4px 20px rgba(43,38,34,0.05)",
      }}
    >
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
  );
}

export default function WhatWeBelieve() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const headingCharRefs = useRef([]);
  const cardRefs = useRef([]);
  const containerRefs = useRef([]);
  const reduceMotion = useReducedMotion();

  // Scroll-SCRUBBED character-by-character heading reveal, rebuilt from the
  // React Bits "ScrollFloat" pattern (chars start dropped/squashed via
  // yPercent/scaleY/scaleX and settle into place on scroll) but adapted
  // rather than dropped in verbatim -- ScrollFloat is a standalone
  // component with its own CSS file and several defaults that don't fit
  // this codebase:
  //   - ease: "none" here, not the reference's bouncy "back.inOut(2)" --
  //     every scrub: true animation on this site uses ease: "none" (Quote,
  //     About, Projects, HeroQuoteTransition, AboutHero) so scroll position
  //     maps to progress 1:1; a bounce would visibly stutter/reverse against
  //     scroll instead of tracking it, and would be the one inconsistent
  //     scrub on the whole site.
  //   - This heading's own existing type treatment (Agatho, INK, the
  //     text-[36px]/md:text-[64px] scale already on the <h2> below) carries
  //     over as-is -- not ScrollFloat's own demo styling
  //     (font-weight: 900 at a clamp(1.6rem, 8vw, 10rem) scale), which was
  //     that library's own CSS file, not a real requirement of the effect.
  //   - No `scroller` is passed to scrollTrigger -- grepped the rest of
  //     this codebase (including SmoothScroll.jsx's own Lenis wiring) and
  //     nothing here ever sets ScrollTrigger's scroller or a scrollerProxy;
  //     Lenis just keeps the native window scroll position in sync and
  //     pokes ScrollTrigger.update() on each tick, so every trigger project-
  //     wide (this one included) defaults to window like normal. Passing a
  //     scrollContainerRef the way the reference's own API expects would
  //     have pointed this at a scroller nothing else in the project uses.
  //   - Gated through usePreloaderGate, which the reference's plain
  //     useEffect has no equivalent of -- every other ScrollTrigger-driven
  //     component on this site waits for "preloader:complete" because
  //     trigger start/end are measured against layout that only settles
  //     once the preloader's intro finishes; skipping that gate is a
  //     plausible reason a previous pass at this heading never fired
  //     correctly on the real page even though it measured fine in
  //     isolated testing.
  //   - start/end are this heading's own values (not the reference's own
  //     'center bottom+=50%'/'bottom bottom-=40%', tuned for its own demo
  //     layout), picked and scroll-tested against this heading's actual
  //     position: "top 85%" fires as it enters the lower part of the
  //     viewport, "top 40%" finishes with it still comfortably on screen
  //     rather than exiting off the top mid-reveal.
  //   - reduceMotion (below, in the JSX) renders the plain heading string
  //     immediately with no animation, same as ScrollFloat has no
  //     equivalent for and every other animated element on this site does
  //     handle.
  // Deliberately its own usePreloaderGate call and its own ScrollTrigger,
  // trigger'd on headingRef directly -- not nested inside sectionRef's own
  // transformed content (the stack effect below never transforms
  // headingRef, and this effect's own gsap.context is scoped to headingRef,
  // not sectionRef), so the two triggers measure against stable,
  // untransformed ancestors and never fight over the same element (the
  // golden rule every scroll-tied effect on this site follows).
  usePreloaderGate(
    () => {
      const chars = headingCharRefs.current.filter(Boolean);
      if (chars.length === 0) return undefined;

      const ctx = gsap.context(() => {
        gsap.set(chars, {
          opacity: 0,
          yPercent: 120,
          scaleY: 2.3,
          scaleX: 0.7,
          transformOrigin: "50% 0%",
        });

        gsap.to(chars, {
          opacity: 1,
          yPercent: 0,
          scaleY: 1,
          scaleX: 1,
          ease: "none",
          stagger: 0.03,
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            end: "top 40%",
            scrub: true,
          },
        });
      }, headingRef);

      return () => ctx.revert();
    },
    [],
    !reduceMotion
  );

  // Sticky-stack cover scrub. The pile-up itself -- each card settling
  // slightly lower than the last, leaving a sliver of the previous one
  // visible -- is pure CSS (position: sticky + an incrementing `top`, see
  // the JSX below); no GSAP needed for that part, and no ScrollTrigger
  // ever targets a card as its own trigger. GSAP only adds the depth cue:
  // as card i's own container starts scrolling through, card i-1 (the one
  // about to be buried) scales/dims down. Container i (a plain,
  // untransformed height-reserving box) is always the trigger; the card
  // being scrubbed is always a DIFFERENT element (i-1) than the trigger
  // (i) -- so nothing here is ever both the trigger/target of its own
  // ScrollTrigger AND transformed by a parent's scroll animation (the
  // golden rule).
  usePreloaderGate(
    () => {
      const cards = cardRefs.current.filter(Boolean);
      const containers = containerRefs.current.filter(Boolean);
      if (cards.length !== BELIEFS.length || containers.length !== BELIEFS.length) {
        return undefined;
      }

      const ctx = gsap.context(() => {
        gsap.set(cards, { scale: 1, opacity: 1 });

        for (let i = 1; i < containers.length; i++) {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: containers[i],
              start: "top top",
              end: "bottom bottom",
              scrub: true,
            },
          });

          // Anchor to 1 "unit" so STACK_COVER_FRACTION below reads as a
          // literal fraction of container i's own scroll range -- same
          // trick every other multi-phase timeline on this site uses
          // (About.jsx, Projects.jsx, AboutHero.jsx).
          tl.to({}, { duration: 1 }, 0);

          tl.to(
            cards[i - 1],
            {
              scale: STACK_COVERED_SCALE,
              opacity: STACK_COVERED_OPACITY,
              ease: "none",
              duration: STACK_COVER_FRACTION,
            },
            0
          );
        }
      }, sectionRef);

      return () => ctx.revert();
    },
    [],
    !reduceMotion
  );

  return (
    <section
      ref={sectionRef}
      className="w-full px-6 pt-8 pb-16 md:px-16 md:pt-12 md:pb-24"
      style={{ backgroundColor: CREAM }}
    >
      <div className="mx-auto w-full max-w-[1100px]">
        <h2
          ref={headingRef}
          // overflow-hidden contains the char-reveal's transform overshoot
          // (chars scale/translate well past the line box mid-scrub, see
          // the scrub effect above) to this element's own line-height box,
          // so it can never visually bleed down into the card stack no
          // matter how much extra margin sits between them.
          className="overflow-hidden text-center text-[36px] md:text-[64px]"
          style={{ fontFamily: "var(--font-agatho)", color: INK }}
        >
          {reduceMotion ? (
            HEADING
          ) : (
            // Same word/char-split structure as Quote.jsx's own q2 reveal --
            // each word wrapped in a whiteSpace:nowrap span (so per-char
            // inline-block spans can't individually break mid-word onto the
            // next line), each non-space character its own ref'd
            // inline-block span (the actual stagger targets; spaces between
            // words render as plain text, untouched).
            (() => {
              let flatIndex = 0;
              const words = HEADING.split(" ");
              return words.map((word, wi) => (
                <Fragment key={wi}>
                  <span style={{ whiteSpace: "nowrap" }}>
                    {word.split("").map((char) => {
                      const idx = flatIndex++;
                      return (
                        <span
                          key={idx}
                          ref={(el) => {
                            if (el) headingCharRefs.current[idx] = el;
                          }}
                          className="inline-block"
                        >
                          {char}
                        </span>
                      );
                    })}
                  </span>
                  {wi < words.length - 1 ? " " : ""}
                </Fragment>
              ));
            })()
          )}
        </h2>

        {reduceMotion ? (
          // Reduced motion: no sticky, no scrub -- just a plain, fully
          // visible vertical list, same card visual, same reading order.
          <div className="mt-14 flex flex-col items-center gap-6 md:mt-20 md:gap-8">
            {BELIEFS.map((belief, i) => (
              <BeliefCard key={belief.title} index={i} belief={belief} />
            ))}
          </div>
        ) : (
          <div className="relative mt-14 md:mt-20">
            {BELIEFS.map((belief, i) => {
              const isLast = i === BELIEFS.length - 1;
              const topMobile = NAV_CLEARANCE_MOBILE_PX + i * STACK_STEP_MOBILE_PX;
              const topDesktop = NAV_CLEARANCE_DESKTOP_PX + i * STACK_STEP_DESKTOP_PX;
              const heightMobileVh =
                PER_CARD_SCROLL_VH_MOBILE + (isLast ? LAST_CARD_HOLD_VH_MOBILE : 0);
              const heightDesktopVh =
                PER_CARD_SCROLL_VH_DESKTOP + (isLast ? LAST_CARD_HOLD_VH_DESKTOP : 0);

              return (
                <div
                  key={belief.title}
                  ref={(el) => (containerRefs.current[i] = el)}
                  className="wwb-stack-item relative"
                  style={{
                    "--h-mobile": `${heightMobileVh}vh`,
                    "--h-desktop": `${heightDesktopVh}vh`,
                  }}
                >
                  <div
                    className="wwb-stack-sticky sticky"
                    style={{
                      "--top-mobile": `${topMobile}px`,
                      "--top-desktop": `${topDesktop}px`,
                    }}
                  >
                    <BeliefCard
                      index={i}
                      belief={belief}
                      cardRef={(el) => (cardRefs.current[i] = el)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Both breakpoints live in this one stylesheet -- NOT split between
          an inline `style` default and a media-query override, which was
          tried first and doesn't work: an inline `style` property always
          wins the cascade over any stylesheet rule regardless of
          specificity or @media, so the "desktop" rule would never have
          been able to override it at any viewport width. Keeping height
          and top out of inline style entirely (only the h/top CSS custom
          properties are set inline, which is safe -- a custom property
          isn't the applied property itself) lets the mobile-first base
          rule and the @media override compete on equal footing, the normal
          way responsive CSS is supposed to work. */}
      <style jsx>{`
        .wwb-stack-item {
          height: var(--h-mobile);
        }
        .wwb-stack-sticky {
          top: var(--top-mobile);
        }
        @media (min-width: 768px) {
          .wwb-stack-item {
            height: var(--h-desktop);
          }
          .wwb-stack-sticky {
            top: var(--top-desktop);
          }
        }
      `}</style>
    </section>
  );
}

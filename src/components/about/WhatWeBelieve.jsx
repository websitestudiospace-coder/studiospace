"use client";

import { useEffect, useRef, useState } from "react";
import { getLenis } from "@/lib/lenis";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";
import { responsiveImageProps } from "@/lib/cloudinaryImage";

const CREAM = "#F7EFE4";
const CARD_SURFACE = "#FBF6EE";
const INK = "#2B2622";
const MAROON = "#6E1F24";

const HEADING = "What We Believe";

// The client's six "SP_ACE Way" points. Stack depth and scroll length are
// derived from BELIEFS.length.
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

// Scroll-pinned card stack (adapted from React Bits' "ScrollStack"). The
// frame pins with position: sticky and cards are moved by manual scroll
// math, subscribed to the site's single shared Lenis instance
// (src/lib/lenis.js) -- never create a second one. Photos arrive as
// `beliefImages` from about/page.js, a server component, because resolving
// them reads the filesystem.

// Scroll budget per card (vh), plus a hold after the last card settles.
// Shorter on mobile, like the site's other pinned sequences.
const ITEM_DISTANCE_VH_DESKTOP = 70;
const ITEM_DISTANCE_VH_MOBILE = 50;
const TRAILING_HOLD_VH_DESKTOP = 35;
const TRAILING_HOLD_VH_MOBILE = 20;

// Cards already in place when the pin starts. On mobile the first card shows
// immediately so the pinned heading never sits over an empty frame.
const LEAD_CARDS_DESKTOP = 0;
const LEAD_CARDS_MOBILE = 1;

function sectionVh(isDesktop) {
  const itemDistanceVh = isDesktop ? ITEM_DISTANCE_VH_DESKTOP : ITEM_DISTANCE_VH_MOBILE;
  const trailingHoldVh = isDesktop ? TRAILING_HOLD_VH_DESKTOP : TRAILING_HOLD_VH_MOBILE;
  const leadCards = isDesktop ? LEAD_CARDS_DESKTOP : LEAD_CARDS_MOBILE;
  const activeVh = (BELIEFS.length - leadCards) * itemDistanceVh;
  return { leadCards, activeVh, totalVh: activeVh + trailingHoldVh };
}

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

// Opacity/y/scale/zIndex for card `index` at continuous progress `x`
// (0..BELIEFS.length). Shared by every card so they all use the same math.
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
  // Receding cards fade out within the first 0.2 of depth. `depth` equals the
  // next card's arrival progress, so a slower fade leaves two cards' text
  // overlapping for a whole step; the stacked "pile" comes from y/scale.
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

// Inner layout shared by StackCard and StaticCard. On desktop the photo takes
// 58% of the width (most belief photos are portrait, so a narrower panel
// crops them less), with an ink vignette on the edge that meets the text.
function CardBody({ index, belief, image, isDesktop }) {
  return (
    <>
      <div className="relative h-52 w-full shrink-0 md:h-full md:w-[58%]">
        {image?.src && (
          // Plain <img>: the Cloudinary URL arrives already resolved from
          // about/page.js; responsiveImageProps adds resized variants.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            {...responsiveImageProps(image.src, "(min-width: 768px) 372px, min(100vw, 640px)")}
            alt={image.alt || belief.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {/* Vignette sits above the img; an inset box-shadow on the parent
            would paint behind it. */}
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
        // Close contact shadow plus a deeper, diffuse one.
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
  // Start as "reduced" so nothing animates before matchMedia has resolved.
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

      const { leadCards, activeVh, totalVh } = sectionVh(isDesktop);
      const activeFraction = activeVh / totalVh;

      const update = () => {
        const section = sectionRef.current;
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const scrollableHeight = rect.height - window.innerHeight;
        const scrolled = clamp01(scrollableHeight > 0 ? -rect.top / scrollableHeight : 0);
        const x = leadCards + Math.min(scrolled / activeFraction, 1) * (BELIEFS.length - leadCards);

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
        // Fallback if the shared Lenis instance isn't registered yet.
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

  const { totalVh } = sectionVh(isDesktop);

  return (
    <section
      ref={sectionRef}
      className="relative w-full"
      style={{ backgroundColor: CREAM, height: `${totalVh}vh` }}
    >
      {/* Mobile: content sits at the top (pt-28 clears the fixed nav);
          desktop centers it. */}
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-start overflow-hidden px-6 pt-28 md:justify-center md:px-16 md:pt-0">
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

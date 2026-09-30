"use client";

import { useRef, useState } from "react";
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
const CARD_BG = "rgba(43,38,34,0.04)";

// Bare domain of an article URL, used to fetch the outlet's favicon (same
// approach as home/Press.jsx).
function getDomain(pageUrl) {
  try {
    return new URL(pageUrl).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

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

// Press grid: same container and reveal as projects/ProjectsGrid.jsx, with
// card styling borrowed from home/Press.jsx.
export default function MediaGrid({ items }) {
  const gridRef = useRef(null);
  const cardRefs = useRef([]);
  const reduceMotion = useReducedMotion();

  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        const cards = cardRefs.current.filter(Boolean);
        gsap.set(cards, { opacity: 0, y: 32 });

        gsap.to(cards, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      }, gridRef);

      return () => ctx.revert();
    },
    [],
    !reduceMotion
  );

  return (
    <section
      ref={gridRef}
      className="w-full px-6 py-16 md:px-16 md:py-24"
      style={{ backgroundColor: CREAM }}
    >
      <div className="mx-auto grid w-full max-w-[1100px] grid-cols-1 gap-8 md:grid-cols-3 md:gap-8">
        {items.map((item, i) => (
          <a
            key={item.publication + item.date + item.headline}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="group flex h-full flex-col rounded-[8px] border p-6 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(43,38,34,0.3)] hover:shadow-[0_10px_30px_rgba(43,38,34,0.1)] md:p-8"
            style={{
              backgroundColor: CARD_BG,
              borderColor: "rgba(43,38,34,0.1)",
              ...(reduceMotion ? undefined : { opacity: 0 }),
            }}
          >
            {/* Everything always visible (a hover reveal was tried and
                reverted). mt-auto on the footer row pins the button to the
                bottom so buttons line up across a row. */}
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

            <p
              className="mt-6 text-lg font-bold leading-snug md:mt-8 md:text-xl"
              style={{ fontFamily: "var(--font-manrope)", color: INK }}
            >
              {item.headline}
            </p>

            {/* Visual only -- the whole card is already the link. */}
            <div className="mt-auto flex flex-col pt-6 md:pt-8">
              <div className="border-t" style={{ borderColor: "rgba(43,38,34,0.1)" }} />
              <div className="mt-4 flex justify-end md:mt-5">
                <span
                  className="inline-flex items-center rounded-full px-4 py-2 text-xs uppercase tracking-[0.1em] transition-opacity duration-200 ease-out group-hover:opacity-90"
                  style={{ backgroundColor: MAROON, color: CREAM, fontFamily: "var(--font-manrope)" }}
                >
                  Read Article
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

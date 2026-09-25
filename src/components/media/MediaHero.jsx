"use client";

import { useRef } from "react";
import { CldImage } from "next-cloudinary";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";
import InlineWordmark from "@/components/ui/InlineWordmark";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const INK = "#2B2622";
const CREAM = "#F7EFE4";

// Matches the standardized section-heading scale from the Phase 3 pass
// (About/Projects/Press/Contact all share this).
const HEADING_CLASS = "text-[32px] md:text-[48px]";

// Rebuilt to structurally mirror ContactContent.jsx's own hero -- itself
// explicitly modeled on ProjectHero.jsx's established visual language
// (full-bleed photo, bottom-anchored gradient, uppercase Agatho heading
// with the same text-shadow) without importing that file's pinned
// scroll-shrink mechanic, since Contact (and now Media) has nothing
// equivalent to reveal by shrinking an image into a corner -- see
// ContactContent.jsx's own comment on exactly this reasoning. Same
// h-[50vh] md:h-[70vh] sizing, same one-shot usePreloaderGate-gated
// fade+y reveal (not scroll-scrubbed), same reduced-motion behavior
// (renders at its settled state immediately, no animation queued).
export default function MediaHero({ heroPhoto }) {
  const heroRef = useRef(null);
  const reduceMotion = useReducedMotion();

  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        gsap.set(heroRef.current, { opacity: 0, y: 24 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });

        tl.to(heroRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
      }, heroRef);

      return () => ctx.revert();
    },
    [],
    !reduceMotion
  );

  return (
    <section
      ref={heroRef}
      className="relative h-[50vh] w-full overflow-hidden md:h-[70vh]"
      style={reduceMotion ? undefined : { opacity: 0 }}
    >
      {heroPhoto?.src ? (
        <CldImage
          src={heroPhoto.src}
          alt={heroPhoto.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0" style={{ backgroundColor: INK }} />
      )}
      {/* Same gradient ContactContent's hero uses. Measured (not assumed)
          against this specific photo before picking it: its top band
          alone (no gradient) already sits at ~4.8:1 contrast against
          cream text, and ~7.2:1 once this gradient's own top-25%-black
          stop is added -- comfortably legible for the site's default
          transparent-then-solid Nav (see media/page.js, which no longer
          needs `lightHero` now that this hero has a real photo behind
          it). */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/25" />

      {/* TODO: placeholder subtext -- pending final copy approval, same
          convention as every other unconfirmed-copy spot on this site
          (home/Press.jsx's own heading, ContactContent's hero). */}
      <div className="absolute inset-x-0 bottom-0 px-6 pb-8 md:px-16 md:pb-12">
        <h1
          className={`${HEADING_CLASS} uppercase text-white`}
          style={{
            fontFamily: "var(--font-agatho)",
            lineHeight: 1.1,
            textShadow: "0 1px 3px rgba(43,38,34,0.7), 0 2px 12px rgba(43,38,34,0.5)",
          }}
        >
          Studio{" "}
          <span style={{ fontStyle: "italic" }}>
            <InlineWordmark text="SP_ACE" />
          </span>{" "}
          in Press
        </h1>
        <p
          className="mt-4 max-w-lg text-sm md:text-base"
          style={{
            fontFamily: "var(--font-manrope)",
            color: CREAM,
            opacity: 0.85,
            textShadow: "0 1px 3px rgba(43,38,34,0.7)",
          }}
        >
          Everywhere Studio SP_ACE&rsquo;s work has been featured in
          architecture and design press.
        </p>
      </div>
    </section>
  );
}

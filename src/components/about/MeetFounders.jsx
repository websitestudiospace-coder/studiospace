"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const INK = "#2B2622";
const CARD_BG = "rgba(43,38,34,0.04)";

// Same native canvas ratio as AboutHero's S.png/P.png -- object-contain
// against this aspect keeps each cutout's full figure visible, uncropped,
// instead of a generic photo-card ratio that would clip their feet/heads.
const PHOTO_ASPECT = "1067 / 1600";

// TODO: placeholder bios -- swap in the client's real founder bios once
// provided. Names/roles are confirmed (see AboutHero.jsx's alt text).
const FOUNDERS = [
  {
    name: "Shubham",
    role: "Co-Founder",
    photo: "/images/about/S.png",
    alt: "Shubham, co-founder of Studio SP_ACE",
    bio: "Placeholder bio for Shubham goes here -- pending final copy from the client about his background, design philosophy, and role at the studio.",
  },
  {
    name: "Priyanka",
    role: "Co-Founder",
    photo: "/images/about/P.png",
    alt: "Priyanka, co-founder of Studio SP_ACE",
    bio: "Placeholder bio for Priyanka goes here -- pending final copy from the client about her background, design philosophy, and role at the studio.",
  },
];

function FounderCard({ founder, cardRef }) {
  return (
    <div ref={cardRef} className="flex flex-col items-center text-center md:items-start md:text-left">
      <div
        className="relative w-full max-w-[280px] overflow-hidden rounded-[28px] md:max-w-none"
        style={{ aspectRatio: PHOTO_ASPECT, backgroundColor: CARD_BG }}
      >
        <Image
          src={founder.photo}
          alt={founder.alt}
          fill
          sizes="(max-width: 767px) 70vw, 33vw"
          className="object-contain"
        />
      </div>
      <h3
        className="mt-6 text-2xl md:text-3xl"
        style={{ fontFamily: "var(--font-agatho)", color: INK }}
      >
        {founder.name}
      </h3>
      <p
        className="mt-1 text-xs uppercase tracking-[0.15em] md:text-sm"
        style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.55 }}
      >
        {founder.role}
      </p>
      <p
        className="mt-4 max-w-sm text-sm md:text-base"
        style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.65 }}
      >
        {founder.bio}
      </p>
    </div>
  );
}

export default function MeetFounders() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const cardRefs = useRef([]);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    // One-shot reveal (not scroll-scrubbed) -- same Phase 3 pattern as
    // Press/Footer: heading first, then the two founder cards staggered in
    // behind it, all on one timeline against one trigger.
    let ctx;

    const setup = () => {
      ctx = gsap.context(() => {
        const cards = cardRefs.current.filter(Boolean);
        gsap.set(headingRef.current, { opacity: 0, y: 24 });
        gsap.set(cards, { opacity: 0, y: 24 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });

        tl.to(headingRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0);
        tl.to(
          cards,
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.15 },
          0.15
        );
      }, sectionRef);
    };

    if (window.__preloaderDone) {
      setup();
    } else {
      window.addEventListener("preloader:complete", setup, { once: true });
    }

    return () => {
      ctx?.revert();
      window.removeEventListener("preloader:complete", setup);
    };
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className="w-full px-6 py-16 md:px-16 md:py-24"
      style={{ backgroundColor: CREAM }}
    >
      <div className="mx-auto w-full max-w-[1100px]">
        <h2
          ref={headingRef}
          className="text-center text-[32px] md:text-[48px]"
          style={{ fontFamily: "var(--font-agatho)", color: INK }}
        >
          Meet the Founders
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-12 md:mt-16 md:grid-cols-2 md:gap-8">
          {FOUNDERS.map((founder, i) => (
            <FounderCard
              key={founder.name}
              founder={founder}
              cardRef={(el) => (cardRefs.current[i] = el)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

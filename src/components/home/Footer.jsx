"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const INK = "#2B2622";

const WORDMARK = "SP_ACE";
const LOGO_ASPECT_RATIO = "1104 / 268"; // logo.png's natural pixel dimensions

// Solved (via a search against the browser's actual canvas 2D filter
// implementation, not hand-derived matrices, to land on an exact match)
// filter chain that recolors the logo's black-crushed silhouette
// (brightness(0)) to precisely #F7EFE4 -- verified pixel-for-pixel.
const CREAM_LOGO_FILTER =
  "brightness(0) saturate(100%) invert(67%) sepia(4%) saturate(425%) hue-rotate(355deg) brightness(127%) contrast(127%)";

// Mirrors Nav.jsx's LINKS exactly.
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Media", href: "/media" },
  { label: "Contact Us", href: "/contact" },
];

// Only Instagram is a confirmed real account for now -- add Pinterest /
// LinkedIn / Facebook here once the client provides them.
const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com/studio_sp_ace" },
];

// Renders "SP_ACE" as normal readable text with the underscore drawn as a
// small decorative bar (see the big wordmark below for why: the bundled
// Agatho font's underscore glyph is a "buy font" watermark, not a real
// underscore). Used wherever the wordmark appears inline in copy, sized
// relative to the surrounding text via em units.
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

function FormField({ label, ...inputProps }) {
  return (
    <label className="block">
      <span
        className="block text-[10px] uppercase tracking-[0.15em]"
        style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.55 }}
      >
        {label} *
      </span>
      <input
        {...inputProps}
        required
        className="mt-2 w-full border-0 border-b bg-transparent pb-2 text-sm focus:outline-none"
        style={{
          borderColor: "rgba(247, 239, 228, 0.3)",
          color: CREAM,
          fontFamily: "var(--font-manrope)",
        }}
      />
    </label>
  );
}

export default function Footer() {
  const sectionRef = useRef(null);
  const wordmarkRef = useRef(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const motionMql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(motionMql.matches);
    update();
    motionMql.addEventListener("change", update);
    return () => motionMql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      // Left-to-right wipe: clip the right edge in from 100% down to 0%.
      // clip-path's inset() args are top/right/bottom/left, so animating
      // the "right" value is what reveals the image left-to-right.
      gsap.set(wordmarkRef.current, { clipPath: "inset(0% 100% 0% 0%)" });

      gsap.to(wordmarkRef.current, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.1,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: wordmarkRef.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <footer ref={sectionRef} className="w-full" style={{ backgroundColor: INK }}>
      <div className="mx-auto w-full max-w-[1600px] px-6 pt-16 md:px-16 md:pt-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          <div>
            <h3 style={{ fontFamily: "var(--font-agatho)", color: CREAM }} className="leading-none">
              <span className="block text-lg uppercase tracking-[0.05em] md:text-xl">Join the</span>
              <span className="block text-6xl uppercase md:text-7xl" style={{ lineHeight: 0.95 }}>
                World
              </span>
              <span className="block text-lg uppercase tracking-[0.05em] md:text-xl">
                of <InlineWordmark text={WORDMARK} />
              </span>
            </h3>
            <p
              className="mt-4 max-w-xs text-sm"
              style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.6 }}
            >
              Subscribe to join our community and stay up to date with the studio.
            </p>

            <form className="mt-8 w-full max-w-sm">
              <div className="grid grid-cols-2 gap-6">
                <FormField label="First Name" type="text" name="firstName" autoComplete="given-name" />
                <FormField label="Last Name" type="text" name="lastName" autoComplete="family-name" />
              </div>

              <div className="relative mt-6 max-w-xs">
                <FormField label="Email" type="email" name="email" autoComplete="email" />
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                  className="pointer-events-none absolute right-0 bottom-3"
                >
                  <path d="M1 1L11 6L1 11V1Z" fill={CREAM} />
                </svg>
              </div>

              <button
                type="submit"
                className="mt-8 inline-block border-b pb-1 text-xs uppercase tracking-[0.15em] transition-opacity duration-300 hover:opacity-70"
                style={{ borderColor: CREAM, color: CREAM, fontFamily: "var(--font-manrope)" }}
              >
                Submit Form
              </button>
            </form>
          </div>

          <nav className="flex flex-col items-start gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs uppercase tracking-[0.15em] transition-opacity duration-300 hover:opacity-70 md:text-sm"
                style={{ fontFamily: "var(--font-manrope)", color: CREAM }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col items-start gap-3">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-[0.15em] transition-opacity duration-300 hover:opacity-70 md:text-sm"
                style={{ fontFamily: "var(--font-manrope)", color: CREAM }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-16 flex w-full justify-center md:mt-24">
          <div
            ref={wordmarkRef}
            className="relative w-[79.2%]"
            style={{ aspectRatio: LOGO_ASPECT_RATIO }}
          >
            <Image
              src="/logos/logo.png"
              alt="SP_ACE"
              fill
              sizes="(max-width: 768px) 90vw, 1300px"
              className="object-contain"
              style={{ filter: CREAM_LOGO_FILTER }}
            />
          </div>
        </div>

        <div
          className="mt-10 grid grid-cols-1 gap-3 border-t py-6 text-center text-[11px] uppercase tracking-[0.15em] md:grid-cols-3 md:gap-4 md:text-left"
          style={{ borderColor: "rgba(247, 239, 228, 0.15)" }}
        >
          <Link
            href="/terms"
            className="justify-self-center md:justify-self-start"
            style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.55 }}
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="justify-self-center"
            style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.55 }}
          >
            Privacy Policy
          </Link>
          <span
            className="justify-self-center md:justify-self-end md:text-right"
            style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.55 }}
          >
            © 2026 Studio Splace. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}

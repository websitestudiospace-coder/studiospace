"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "@/components/ui/Button";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const INK = "#2B2622";

const WORDMARK = "SP_ACE";
const LOGO_ASPECT_RATIO = "6154 / 2752"; // logo.png's real natural pixel dimensions (previous value was stale)

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
        className="block text-xs uppercase tracking-[0.15em]"
        style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.65 }}
      >
        {label} *
      </span>
      <input
        {...inputProps}
        required
        // py-2.5 (not just pb-2) gives this a taller tap/focus target on
        // mobile -- previously ~29px tall, under the ~44px touch-target
        // guideline. Same fix as ContactContent.jsx's own fieldClass.
        className="mt-2 w-full border-0 border-b bg-transparent py-2.5 text-sm focus:outline-none"
        style={{
          borderColor: "rgba(247, 239, 228, 0.3)",
          color: CREAM,
          fontFamily: "var(--font-manrope)",
        }}
      />
    </label>
  );
}

function SignupBlock({ blockRef }) {
  const [submitted, setSubmitted] = useState(false);

  // No backend or email service is wired up yet -- this just flips local
  // state instead of letting the browser fall back to a native GET submit
  // (which would reload the page with every field appended to the URL as a
  // query string). Same placeholder pattern as ContactContent's form; before
  // launch, replace this handler with a real submission.
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div ref={blockRef} className="col-span-2 md:col-span-1">
      <h3 style={{ fontFamily: "var(--font-agatho)", color: CREAM }} className="leading-none">
        <span className="block text-lg uppercase tracking-[0.05em] md:text-xl">Join the</span>
        <span className="block text-6xl uppercase md:text-7xl" style={{ lineHeight: 0.95 }}>
          World
        </span>
        <span className="block text-lg uppercase tracking-[0.05em] md:text-xl">
          of Studio <InlineWordmark text={WORDMARK} />
        </span>
      </h3>
      <p
        className="mt-4 max-w-xs text-sm"
        style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.65 }}
      >
        Subscribe to join our community and stay up to date with the studio.
      </p>

      {submitted ? (
        <p
          className="mt-8 max-w-xs text-sm"
          style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.8 }}
        >
          Thanks for subscribing — we&apos;ll keep you posted.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 w-full max-w-sm">
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

          <Button type="submit" variant="text" className="mt-8">
            Submit Form
          </Button>
        </form>
      )}
    </div>
  );
}

// `contents` on mobile keeps nav/social as two independent grid items (the
// existing side-by-side half-width columns below the signup block);
// md:flex stacks them into ONE grid column instead of two at desktop --
// previously Instagram had its own full-height column matching nav's
// 5-item height, leaving ~370px of empty space beneath its single link.
// Stacking them removes that column entirely rather than inventing filler
// content (no second confirmed social account or studio address/hours
// exists yet to legitimately fill a real third column).
function LinksColumns({ navRef, socialRef }) {
  return (
    <div className="contents md:flex md:flex-col md:items-start md:gap-8">
      <nav ref={navRef} className="flex flex-col items-start">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center py-3.5 text-xs uppercase tracking-[0.15em] transition-opacity duration-200 ease-out hover:opacity-70 md:text-sm"
            style={{ fontFamily: "var(--font-manrope)", color: CREAM }}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div ref={socialRef} className="flex flex-col items-start">
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center py-3.5 text-xs uppercase tracking-[0.15em] transition-opacity duration-200 ease-out hover:opacity-70 md:text-sm"
            style={{ fontFamily: "var(--font-manrope)", color: CREAM }}
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function Wordmark({ wordmarkRef }) {
  return (
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
  );
}

function LegalRow() {
  return (
    <div
      className="mt-6 grid grid-cols-1 gap-3 border-t py-4 text-center text-xs uppercase tracking-[0.15em] md:mt-8 md:grid-cols-3 md:gap-4 md:py-6 md:text-left"
      style={{ borderColor: "rgba(247, 239, 228, 0.15)" }}
    >
      <Link
        href="/terms"
        className="flex items-center justify-center py-3.5 justify-self-center md:justify-self-start"
        style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.65 }}
      >
        Terms of Service
      </Link>
      <Link
        href="/privacy"
        className="flex items-center justify-center py-3.5 justify-self-center"
        style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.65 }}
      >
        Privacy Policy
      </Link>
      <span
        className="justify-self-center md:justify-self-end md:text-right"
        style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.65 }}
      >
        © 2026 Studio SP_ACE. All rights reserved.
      </span>
    </div>
  );
}

export default function Footer() {
  const sectionRef = useRef(null);
  const signupRef = useRef(null);
  const navRef = useRef(null);
  const socialRef = useRef(null);
  const wordmarkRef = useRef(null);
  const reduceMotion = useReducedMotion();

  // One-shot reveal (not scroll-scrubbed): Footer doesn't need to feel
  // scroll-locked, so it just plays once as it enters the viewport. Still
  // waits for "preloader:complete" since "top 80%" is calculated against
  // this section's own position, which depends on every section above it
  // already being in its final, settled layout.
  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        // ONE consolidated timeline: signup block first, then the nav/social
        // link columns together, then the wordmark wipes in -- same
        // single-timeline rule as every other section (no separate triggers
        // per piece).
        gsap.set(signupRef.current, { opacity: 0, y: 24 });
        gsap.set([navRef.current, socialRef.current], { opacity: 0, y: 24 });
        gsap.set(wordmarkRef.current, { clipPath: "inset(0% 100% 0% 0%)" });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });

        tl.to(signupRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0);
        tl.to(
          [navRef.current, socialRef.current],
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
          0.15
        );
        // Left-to-right wipe: clip the right edge in from 100% down to 0%.
        // clip-path's inset() args are top/right/bottom/left, so animating
        // the "right" value is what reveals the image left-to-right.
        tl.to(
          wordmarkRef.current,
          { clipPath: "inset(0% 0% 0% 0%)", ease: "power3.out", duration: 0.7 },
          0.35
        );
      }, sectionRef);

      return () => ctx.revert();
    },
    [],
    !reduceMotion
  );

  return (
    <footer id="footer" ref={sectionRef} className="w-full" style={{ backgroundColor: INK }}>
      <div className="mx-auto w-full max-w-[1600px] px-6 pt-16 md:px-16 md:pt-24">
        {/* grid-cols-2 (not -1) at mobile, with the signup block spanning
            both columns, so the nav/social columns share a row instead of
            each getting their own full-width stack. Desktop is also
            grid-cols-2 (not -3) -- LinksColumns collapses nav+social into
            one column there (see its own comment), so signup and links are
            the only two real columns. */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-2 md:gap-16">
          <SignupBlock blockRef={signupRef} />
          <LinksColumns navRef={navRef} socialRef={socialRef} />
        </div>
        <Wordmark wordmarkRef={wordmarkRef} />
        <LegalRow />
      </div>
    </footer>
  );
}

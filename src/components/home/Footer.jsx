"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ContactForm from "@/components/contact/ContactForm";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";
import InlineWordmark from "@/components/ui/InlineWordmark";

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

// Intro copy invites a project enquiry (not a newsletter signup -- this
// used to be one); the form is the full project enquiry form, shared
// with the Contact page (same fields, validation, /api/contact POST and
// success popup -- see ContactForm.jsx). "text" keeps the Footer's own
// underlined submit button rather than the Contact page's filled one.
function SignupBlock({ blockRef }) {
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
        Have a space in mind? Share a few details about your project and
        we&apos;ll be in touch.
      </p>

      <div className="mt-8">
        <ContactForm submitVariant="text" />
      </div>
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
//
// `fullWidth` (Footer's hideForm case): with no form block beside it, the
// stacked column would sit in the left half with the right half empty, so
// at desktop it spans both grid columns with nav left and social right.
function LinksColumns({ navRef, socialRef, fullWidth = false }) {
  return (
    <div
      className={
        fullWidth
          ? "contents md:col-span-2 md:flex md:flex-row md:items-start md:justify-between"
          : "contents md:flex md:flex-col md:items-start md:gap-8"
      }
    >
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

// `hideForm` drops the enquiry form block (SignupBlock) and keeps the rest
// of the footer -- used on /contact, where the same form already sits
// directly above the footer as "Design With Us".
export default function Footer({ hideForm = false }) {
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
        // signupRef is null when hideForm skips the form block -- only
        // animate it when it's actually rendered.
        const signup = signupRef.current;
        if (signup) gsap.set(signup, { opacity: 0, y: 24 });
        gsap.set([navRef.current, socialRef.current], { opacity: 0, y: 24 });
        gsap.set(wordmarkRef.current, { clipPath: "inset(0% 100% 0% 0%)" });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });

        if (signup) tl.to(signup, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0);
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
          {!hideForm && <SignupBlock blockRef={signupRef} />}
          <LinksColumns navRef={navRef} socialRef={socialRef} fullWidth={hideForm} />
        </div>
        <Wordmark wordmarkRef={wordmarkRef} />
        <LegalRow />
      </div>
    </footer>
  );
}

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

// Filter chain that recolours the logo's black silhouette (brightness(0)) to
// exactly #F7EFE4 (cream).
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

// Only Instagram is confirmed so far -- add other networks when the client
// provides them.
const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com/studio_sp_ace" },
];

// Same "General" inbox the Contact page lists (ContactContent.jsx's
// GENERAL_INQUIRIES_ENTRIES). Plain text here, not a mailto link.
const GENERAL_EMAIL = "hello@studiospace.co.in";

const MICRO_LABEL_CLASS = "block text-[11px] uppercase tracking-[0.15em] md:text-xs";

// The shared project enquiry form (see ContactForm.jsx), with the Footer's
// underlined "text" submit button. No intro line, at the client's request.
function SignupBlock({ blockRef }) {
  return (
    <div ref={blockRef} className="col-span-2 md:col-span-1">
      <h2 style={{ fontFamily: "var(--font-agatho)", color: CREAM }} className="leading-none">
        <span className="block text-lg uppercase tracking-[0.05em] md:text-xl">Join the</span>
        <span className="block text-6xl uppercase md:text-7xl" style={{ lineHeight: 0.95 }}>
          World
        </span>
        <span className="block text-lg uppercase tracking-[0.05em] md:text-xl">
          of Studio <InlineWordmark text={WORDMARK} />
        </span>
      </h2>

      <div className="mt-8">
        <ContactForm submitVariant="text" />
      </div>
    </div>
  );
}

// Nav links plus a contact block (email + Instagram). `contents` on mobile
// makes them two independent half-width grid items; on desktop they sit side
// by side in the right-hand column. `fullWidth` (hideForm) spans both
// columns.
function LinksColumns({ navRef, socialRef, fullWidth = false }) {
  return (
    <div
      className={
        fullWidth
          ? "contents md:col-span-2 md:flex md:flex-row md:items-start md:justify-between"
          : "contents md:flex md:flex-row md:items-start md:gap-12 lg:gap-24 xl:gap-32"
      }
    >
      <nav ref={navRef} className="flex shrink-0 flex-col items-start">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center whitespace-nowrap py-3.5 text-xs uppercase tracking-[0.15em] transition-opacity duration-200 ease-out hover:opacity-70 md:text-sm"
            style={{ fontFamily: "var(--font-manrope)", color: CREAM }}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* pt-3.5 lines each label up with the first nav link's text (the
          nav links carry py-3.5 tap-target padding). */}
      <div ref={socialRef} className="flex flex-col items-start gap-7 pt-3.5">
        <div>
          <span className={MICRO_LABEL_CLASS} style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.55 }}>
            Email
          </span>
          {/* <wbr> lets the address break after the @ in the narrow mobile
              column. */}
          <p
            className="mt-2 text-[13px] md:text-sm"
            style={{ fontFamily: "var(--font-manrope)", color: CREAM }}
          >
            {GENERAL_EMAIL.split("@")[0]}@<wbr />
            {GENERAL_EMAIL.split("@")[1]}
          </p>
        </div>

        <div>
          <span className={MICRO_LABEL_CLASS} style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.55 }}>
            Follow
          </span>
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="-my-1.5 flex items-center gap-2 py-3.5 text-xs uppercase tracking-[0.15em] transition-opacity duration-200 ease-out hover:opacity-70 md:text-sm"
              style={{ fontFamily: "var(--font-manrope)", color: CREAM }}
            >
              {link.label}
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
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

// Terms left, copyright centered, Privacy right: the middle column is `auto`
// between two 1fr columns, so the copyright sits at the true center. Below
// lg they don't fit on one line, so Terms/Privacy share a row with the
// copyright centered beneath. DOM order matches the visual order.
function LegalRow() {
  const textStyle = { fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.65 };
  const linkClass = "flex items-center whitespace-nowrap py-3.5 transition-opacity duration-200 ease-out hover:opacity-70";
  return (
    <div
      className="mt-6 grid grid-cols-2 items-center gap-x-4 border-t py-4 text-xs uppercase tracking-[0.15em] md:mt-8 md:py-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-x-6"
      style={{ borderColor: "rgba(247, 239, 228, 0.15)" }}
    >
      <Link href="/terms" className={`${linkClass} col-start-1 row-start-1 justify-self-start`} style={textStyle}>
        Terms of Service
      </Link>
      <span
        className="col-span-2 row-start-2 pb-2 text-center lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:pb-0"
        style={textStyle}
      >
        © 2026 Studio SP_ACE. All rights reserved.
      </span>
      <Link
        href="/privacy"
        className={`${linkClass} col-start-2 row-start-1 justify-self-end lg:col-start-3`}
        style={textStyle}
      >
        Privacy Policy
      </Link>
    </div>
  );
}

// `hideForm` drops the enquiry form, used on /contact where the same form
// sits directly above the footer.
export default function Footer({ hideForm = false }) {
  const sectionRef = useRef(null);
  const signupRef = useRef(null);
  const navRef = useRef(null);
  const socialRef = useRef(null);
  const wordmarkRef = useRef(null);
  const reduceMotion = useReducedMotion();

  // One-shot reveal; waits for the preloader so "top 80%" is measured
  // against settled layout.
  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        // One timeline: form block, then link columns, then the wordmark
        // wipe. signupRef is null when hideForm is set.
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
        // Left-to-right wipe by animating clip-path inset()'s right value.
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
        {/* Two columns at every width: the form block spans both on mobile,
            and nav + contact share the second column on desktop. */}
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

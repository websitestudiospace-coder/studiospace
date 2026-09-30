"use client";

import { useRef } from "react";
import { CldImage } from "next-cloudinary";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ContactForm from "@/components/contact/ContactForm";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const INK = "#2B2622";

// Client-specified shade for the Careers panel only (not the brand MAROON,
// which the enquiry form also uses).
const CAREERS_MAROON = "rgb(73, 13, 15)";

// Matches the standardized section-heading scale from the Phase 3 pass
// (About/Projects/Press all share this).
const HEADING_CLASS = "text-[32px] md:text-[48px]";

// "Studio Location" (not "Location") to avoid confusion with the form's own
// Location field. No phone row until the client provides a real number --
// never a placeholder.
const STUDIO_INFO = [
  { label: "Studio Location", value: "Bangalore, India" },
  { label: "Email", value: "hello@studiospace.co.in", href: "mailto:hello@studiospace.co.in" },
];

const INSTAGRAM_URL = "https://instagram.com/studio_sp_ace";

// "Let's Connect" panel entries. Separate from STUDIO_INFO because this
// panel labels and orders them differently. hello@ is the only inbox here;
// careers@ is in the "Join Our Team" panel.
const GENERAL_INQUIRIES_ENTRIES = [
  { label: "Studio", value: "Bangalore, India" },
  { label: "General", value: "hello@studiospace.co.in", href: "mailto:hello@studiospace.co.in" },
  { label: "Instagram", value: "@studio_sp_ace", href: INSTAGRAM_URL },
];

// Client-provided Careers inbox (2026-09-21), replacing the earlier
// "[Careers copy pending from client]" placeholder copy/link.
const CAREERS_EMAIL = "careers@studiospace.co.in";

function StudioInfo({ infoRef }) {
  return (
    <div ref={infoRef} className="flex flex-col gap-6">
      {STUDIO_INFO.map((item) => (
        <div key={item.label}>
          <span
            className="block text-xs uppercase tracking-[0.15em]"
            style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.65 }}
          >
            {item.label}
          </span>
          {item.href ? (
            <a
              href={item.href}
              className="hit-area mt-1 inline-block text-sm transition-opacity duration-200 ease-out hover:opacity-70 md:text-base"
              style={{ fontFamily: "var(--font-manrope)", color: CREAM }}
            >
              {item.value}
            </a>
          ) : (
            <p
              className="mt-1 text-sm md:text-base"
              style={{ fontFamily: "var(--font-manrope)", color: CREAM }}
            >
              {item.value}
            </p>
          )}
        </div>
      ))}

      <div>
        <span
          className="block text-xs uppercase tracking-[0.15em]"
          style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.65 }}
        >
          Instagram
        </span>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hit-area mt-1 inline-block text-sm transition-opacity duration-200 ease-out hover:opacity-70 md:text-base"
          style={{ fontFamily: "var(--font-manrope)", color: CREAM }}
        >
          @studio_sp_ace
        </a>
      </div>
    </div>
  );
}

// Two-panel contact block: "Let's Connect" (cream) and "Join Our Team"
// (careers colour).
function InquiriesSplit({ splitRef }) {
  return (
    <div
      ref={splitRef}
      className="mt-16 grid w-full grid-cols-1 overflow-hidden md:mt-24 md:grid-cols-2"
    >
      {/* text-center on the wrapper so each label/value pair centers as one
          unit. */}
      <div className="px-8 py-12 text-center md:px-12 md:py-16" style={{ backgroundColor: CREAM }}>
        <h2
          className={`${HEADING_CLASS} uppercase`}
          style={{ fontFamily: "var(--font-agatho)", color: INK, lineHeight: 1.05 }}
        >
          Let&apos;s Connect
        </h2>

        {/* Client copy, exact (2026-09-21). */}
        <p
          className="mx-auto mt-4 max-w-sm text-sm md:text-base"
          style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.75 }}
        >
          For collaborations, ideas, or just to say hello!
        </p>

        <div className="mt-8 flex flex-col gap-6 md:mt-12">
          {GENERAL_INQUIRIES_ENTRIES.map((entry) => (
            <div key={entry.label}>
              <span
                className="block text-xs uppercase tracking-[0.15em]"
                style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.7 }}
              >
                {entry.label}
              </span>
              {entry.href ? (
                <a
                  href={entry.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hit-area mt-1 inline-block text-sm transition-opacity duration-200 ease-out hover:opacity-70 md:text-base"
                  style={{ fontFamily: "var(--font-manrope)", color: INK }}
                >
                  {entry.value}
                </a>
              ) : (
                <p
                  className="mt-1 text-sm md:text-base"
                  style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.85 }}
                >
                  {entry.value}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Solid CAREERS_MAROON only, no photo -- client request. */}
      <div className="px-8 py-12 text-center md:px-12 md:py-16" style={{ backgroundColor: CAREERS_MAROON }}>
        <h2
          className={`${HEADING_CLASS} uppercase`}
          style={{ fontFamily: "var(--font-agatho)", color: CREAM, lineHeight: 1.05 }}
        >
          Join Our Team
        </h2>

        {/* Client copy. mx-auto centers the max-w-sm box itself. */}
        <p
          className="mx-auto mt-4 max-w-sm text-sm md:text-base"
          style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.85 }}
        >
          Interested in joining our team? We&apos;d love to hear from you.
        </p>

        {/* Client request: the careers address as plain text, not a
            mailto link (no underline). */}
        <p
          className="mt-6 text-sm md:text-base"
          style={{ fontFamily: "var(--font-manrope)", color: CREAM }}
        >
          {CAREERS_EMAIL}
        </p>
      </div>
    </div>
  );
}

export default function ContactContent({ heroPhoto }) {
  const heroRef = useRef(null);
  const formRef = useRef(null);
  const infoRef = useRef(null);
  const inquiriesRef = useRef(null);
  const reduceMotion = useReducedMotion();

  // One-shot reveal on load (the hero is first on the page, so "top 80%" is
  // already met). Waits for the preloader so the measurement is settled.
  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        gsap.set(heroRef.current, { opacity: 0, y: 24 });
        gsap.set(
          [formRef.current, infoRef.current, inquiriesRef.current],
          { opacity: 0, y: 24 }
        );

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });

        tl.to(heroRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0);
        tl.to(
          [formRef.current, infoRef.current, inquiriesRef.current],
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.1 },
          0.3
        );
      }, heroRef);

      return () => ctx.revert();
    },
    [],
    !reduceMotion
  );

  return (
    <>
      {/* Full-bleed hero with a bottom gradient and overlaid heading, in the
          same visual style as the project pages (without their pinned
          shrink, which exists to reveal project stats). Starts at y:0 under
          the transparent Nav. */}
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/25" />

        {/* TODO: placeholder heading + subtext -- pending final copy approval. */}
        <div className="absolute inset-x-0 bottom-0 px-6 pb-8 md:px-16 md:pb-12">
          <h1
            className={`${HEADING_CLASS} uppercase text-white`}
            style={{
              fontFamily: "var(--font-agatho)",
              lineHeight: 1.1,
              textShadow: "0 1px 3px rgba(43,38,34,0.7), 0 2px 12px rgba(43,38,34,0.5)",
            }}
          >
            Let&apos;s Talk
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
            Tell us a little about your project and we&apos;ll get back to you
            to start the conversation.
          </p>
        </div>
      </section>

      {/* Top padding only: the Footer that follows is also ink and has its
          own top padding. */}
      <section className="w-full pt-16 md:pt-24" style={{ backgroundColor: INK }}>
        <div className="mx-auto w-full max-w-[1100px] px-6 md:px-16">
          <div className="grid grid-cols-1 gap-16 md:grid-cols-[1.4fr_1fr]">
            <div>
              {/* Client copy, exact (2026-09-21): heading + subheading go
                  directly above the form, not as a separate section. */}
              <h2
                className={`${HEADING_CLASS} uppercase`}
                style={{ fontFamily: "var(--font-agatho)", color: CREAM, lineHeight: 1.05 }}
              >
                Design With Us
              </h2>
              <p
                className="mt-4 max-w-lg text-sm md:text-base"
                style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.75 }}
              >
                Tell us your story. Let&apos;s bring it to life!
              </p>

              <div className="mt-10">
                <ContactForm formRef={formRef} />
              </div>
            </div>
            <StudioInfo infoRef={infoRef} />
          </div>
        </div>

        {/* Full-bleed (outside the max-w-[1100px] column), so no rounded
            corners. */}
        <InquiriesSplit splitRef={inquiriesRef} />
      </section>
    </>
  );
}

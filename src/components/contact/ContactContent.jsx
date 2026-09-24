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

// Client-provided exact shade for the Careers panel below (2026-09-14) --
// deliberately its own constant rather than reusing the brand MAROON
// (#6E1F24), since the client's ask was scoped to just that one panel
// replacing its photo, not a site-wide brand-maroon change (which would
// also shift the enquiry form's borders/asterisk/submit button -- see
// ContactForm.jsx).
const CAREERS_MAROON = "rgb(73, 13, 15)";

// Matches the standardized section-heading scale from the Phase 3 pass
// (About/Projects/Press all share this).
const HEADING_CLASS = "text-[32px] md:text-[48px]";

// TODO: phone not yet provided by the client -- do not fabricate a
// plausible-looking number, it would be mistaken for real contact info.
// Email is now real (client-provided, 2026-09-21): hello@studiospace.co.in.
const CONTACT_COMING_SOON = "Coming soon — reach us on Instagram for now";

// Studio Location mirrors the Instagram bio and is real. Labeled "Studio
// Location" (not just "Location") to disambiguate from the form's own
// "Location" field, which asks for the client's project location instead.
const STUDIO_INFO = [
  { label: "Studio Location", value: "Bangalore, India" },
  { label: "Email", value: "hello@studiospace.co.in", href: "mailto:hello@studiospace.co.in" },
  { label: "Phone", value: CONTACT_COMING_SOON },
];

const INSTAGRAM_URL = "https://instagram.com/studio_sp_ace";

// Backs the "Let's Connect" (formerly "General Inquiries") left panel of
// InquiriesSplit below. Deliberately a separate array from STUDIO_INFO
// above, not a reuse of it -- this panel's own spec calls the first entry
// "Studio" (not "Studio Location") and wants Instagram as its own stacked
// entry rather than hardcoded separately, so the *shape* differs even
// though the real values are identical to (and sourced from the same
// constants as) STUDIO_INFO/INSTAGRAM_URL above. Per the client's latest
// request, hello@ (labelled just "General") is the only inbox listed here;
// careers@ lives in the right/"Join Our Team" panel. The inquiry@ and
// personal shubham@/priyanka@ inboxes were all dropped.
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
              className="mt-1 inline-block text-sm transition-opacity duration-200 ease-out hover:opacity-70 md:text-base"
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
          className="mt-1 inline-block text-sm transition-opacity duration-200 ease-out hover:opacity-70 md:text-base"
          style={{ fontFamily: "var(--font-manrope)", color: CREAM }}
        >
          @studio_sp_ace
        </a>
      </div>
    </div>
  );
}

// Redesigned per a client-shared reference (2026-09-08): a fuller,
// richer two-column split-color block -- structural/typographic
// inspiration only, NOT the reference's own blue/tan colors, fake
// multi-city offices, or "Press Enquiries" copy, none of which apply
// here. Confirmed via grep before starting that no such content, fake or
// otherwise, exists anywhere in this codebase to adapt -- this is a
// from-scratch build using this site's own tokens/data. Left panel: a
// large two-line uppercase Agatho heading (same HEADING_CLASS every
// other section heading on this page/site uses) over stacked
// micro-label + value entries, matching the reference's "large heading,
// then several labeled contact blocks" hierarchy. Right panel: same
// heading scale, brand maroon at full opacity (re-confirmed, not a
// tinted/blended shade -- see the historical muddy-brown bug this
// avoids), Careers copy/link clearly marked pending real content from the
// client where it is.
function InquiriesSplit({ splitRef }) {
  return (
    <div
      ref={splitRef}
      className="mt-16 grid w-full grid-cols-1 overflow-hidden md:mt-24 md:grid-cols-2"
    >
      {/* text-center on this panel's own wrapper, not per-element -- every
          label/value pair below inherits it (the label spans are `block`,
          the value links/paragraphs are `inline-block`, both of which
          respect an ancestor's text-align), so each stacked entry centers
          as one unit with no risk of centering a label while its value
          stays left-aligned. */}
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
                style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.55 }}
              >
                {entry.label}
              </span>
              {entry.href ? (
                <a
                  href={entry.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm transition-opacity duration-200 ease-out hover:opacity-70 md:text-base"
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

        {/* Client copy, exact (2026-09-21). mx-auto centers the max-w-sm
            box itself (not just the text inside it) now that this panel
            is center-aligned -- without it the box would stay flush
            against the left edge with only its own text centered inside
            that narrower, off-center box. */}
        <p
          className="mx-auto mt-4 max-w-sm text-sm md:text-base"
          style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.85 }}
        >
          Interested in joining our team? We&apos;d love to hear from you.
        </p>

        {/* Client-provided Careers inbox (2026-09-21), replacing the
            earlier href="#" placeholder. Swap for a real open-positions
            page link instead if/when the client sets one up. */}
        <a
          href={`mailto:${CAREERS_EMAIL}`}
          className="mt-6 inline-block border-b pb-0.5 text-sm md:text-base"
          style={{ fontFamily: "var(--font-manrope)", color: CREAM, borderColor: CREAM }}
        >
          {CAREERS_EMAIL}
        </a>
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

  // One-shot reveal, not scroll-scrubbed -- this is a simple content
  // page, not a cinematic pinned sequence like ProjectHero's, so it just
  // fades/settles once as it enters the viewport (same Phase 3 pattern
  // as Instagram/Press/Footer). Trigger is the hero itself, the first
  // thing on the page -- "top 80%" is already satisfied at scroll
  // position 0, so this plays essentially immediately on load, same as
  // it did before this section became the hero. Still waits for
  // "preloader:complete" since that "top 80%" measurement depends on
  // Nav/Preloader having already settled.
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
      {/* Real hero, matching how single-project pages open (see
          ProjectHero.jsx's reduced-motion/fallback branch) -- full-bleed
          photo with a bottom-anchored gradient and the heading/subtext
          overlaid directly on it, not a small boxed thumbnail beside the
          text. Deliberately NOT importing ProjectHero itself or copying
          its pinned scroll-shrink sequence: that mechanic exists
          specifically to make room for a stats grid (typology/location/
          sq ft/completion) that Contact has no equivalent of -- its
          content below is a form, not project stats, so there's nothing
          for an image-shrink to "reveal". Mirroring the established
          visual language (full-bleed image, gradient overlay, uppercase
          Agatho heading with the same text-shadow, bottom-left-ish
          overlay position) is what the client actually asked to match;
          the pinned choreography is ProjectHero-specific staging, not
          part of that visual pattern. No top padding, same reasoning as
          ProjectHero/ProjectsHero/AboutHero: the image runs from y:0
          underneath the fixed Nav, which stays in its default
          transparent/cream-text state (no `lightHero`, same as the
          project pages) since the image + gradient give it something
          dark enough to read against without needing the solid-Nav
          treatment About uses for its all-cream hero. */}
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

        {/* TODO: placeholder heading + subtext -- pending final copy approval */}
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

      <section className="w-full py-16 md:py-24" style={{ backgroundColor: INK }}>
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

        {/* Full-bleed relative to the viewport, not this page's usual
            max-w-[1100px] content column -- moved out of that column's own
            div (which still wraps the form/StudioInfo grid above) and the
            section's own former px-6/md:px-16 side padding moved down onto
            that inner div instead of staying on <section> itself, so this
            sibling is no longer subject to it. Same technique IndiaMap.jsx
            already uses for its own full-width map embed. Rounded corners
            dropped for this box specifically now that it runs edge-to-edge
            -- a rounded corner with nothing but flush viewport edge on the
            other side of it reads as a rendering bug, not a deliberate
            shape. */}
        <InquiriesSplit splitRef={inquiriesRef} />
      </section>
    </>
  );
}

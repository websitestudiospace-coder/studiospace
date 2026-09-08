"use client";

import { useRef, useState } from "react";
import { CldImage } from "next-cloudinary";
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
const MAROON = "#6E1F24";

// Matches the standardized section-heading scale from the Phase 3 pass
// (About/Projects/Press all share this).
const HEADING_CLASS = "text-[32px] md:text-[48px]";

// Client spec (recorded walkthrough, 2026-09-08): "Residential" is a parent
// with two sub-types -- flattened into 5 individually-selectable options
// here rather than a two-level UI, since this site's existing form controls
// are single-level selects and the client only needs each of the 5 to be
// choosable on its own.
const PROJECT_TYPES = [
  "Residential – New Build",
  "Residential – Remodel",
  "Commercial",
  "Hospitality",
  "Others",
];

// TODO: real email/phone not yet provided by the client -- do not fabricate
// a plausible-looking number/address, it would be mistaken for real contact
// info. Swap this "coming soon" entry for real values once provided;
// Studio Location mirrors the Instagram bio and is real. Labeled "Studio
// Location" (not just "Location") to disambiguate from the form's own
// "Location" field, which asks for the client's project location instead.
const STUDIO_INFO = [
  { label: "Studio Location", value: "Bangalore, India" },
  { label: "Email & Phone", value: "Coming soon — reach us on Instagram for now" },
];

const INSTAGRAM_URL = "https://instagram.com/studio_sp_ace";

// Client spec: every field on this form is compulsory, no exceptions --
// there is no longer an "optional" concept here at all.
function FieldLabel({ children }) {
  return (
    <span
      className="block text-xs uppercase tracking-[0.15em]"
      style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.65 }}
    >
      {children} *
    </span>
  );
}

const fieldClass =
  "mt-2 w-full border-0 border-b bg-transparent pb-2 text-sm focus:outline-none";
const fieldStyle = {
  borderColor: "rgba(247, 239, 228, 0.3)",
  color: CREAM,
  fontFamily: "var(--font-manrope)",
};

function TextField({ label, ...inputProps }) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input {...inputProps} required className={fieldClass} style={fieldStyle} />
    </label>
  );
}

function SelectField({ label, options, ...selectProps }) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      {/* Callers must pass defaultValue="" (or a controlled value) -- without
          it, browsers skip the disabled placeholder option and auto-select
          the first real option instead, which silently satisfies `required`
          before the user has chosen anything. */}
      <select {...selectProps} required className={fieldClass} style={fieldStyle}>
        <option value="" disabled hidden>
          Select one
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} style={{ color: INK }}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextareaField({ label, ...textareaProps }) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <textarea
        {...textareaProps}
        required
        rows={4}
        className={`${fieldClass} resize-none`}
        style={fieldStyle}
      />
    </label>
  );
}

function ContactForm({ formRef }) {
  const [submitted, setSubmitted] = useState(false);

  // No backend or email service is wired up yet -- this just flips local
  // state and shows a confirmation message (same placeholder pattern as
  // Footer's newsletter signup). Before launch, replace this handler with
  // a real submission (e.g. Formspree, a serverless function, or an email
  // API) and remove the `alert`-free no-op below.
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div ref={formRef} className="max-w-lg">
        <p
          className="text-xl"
          style={{ fontFamily: "var(--font-agatho)", color: CREAM }}
        >
          Thanks, we&apos;ll be in touch.
        </p>
        <p
          className="mt-3 text-sm"
          style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.65 }}
        >
          We&apos;ve received your message and will get back to you shortly.
        </p>
      </div>
    );
  }

  // Field order below is the client's exact spec, verbatim from the
  // recorded walkthrough: name, email, phone, location, project budget,
  // project type, then the project-description textarea last. Every field
  // is compulsory (see FieldLabel/TextField above) -- phone in particular
  // used to be marked optional here and no longer is.
  return (
    <form ref={formRef} onSubmit={handleSubmit} className="w-full max-w-lg">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <TextField label="Name" type="text" name="name" autoComplete="name" />
        <TextField label="Email" type="email" name="email" autoComplete="email" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <TextField label="Phone" type="tel" name="phone" autoComplete="tel" />
        <TextField
          label="Location"
          type="text"
          name="location"
          autoComplete="address-level2"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <TextField label="Project Budget" type="text" name="projectBudget" />
        <SelectField
          label="Project Type"
          name="projectType"
          options={PROJECT_TYPES}
          defaultValue=""
        />
      </div>

      <div className="mt-6">
        <TextareaField
          label="Tell us about your project"
          name="projectDetails"
        />
      </div>

      <Button type="submit" variant="primary" className="mt-8">
        Submit Form
      </Button>
    </form>
  );
}

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

// TODO: client to provide Careers copy. Per the recorded walkthrough, this
// block replaces what would otherwise be a "General Enquiries / Press
// Enquiries" split -- the client wants Careers content here instead, but
// hasn't sent the actual text yet. Solid maroon at full opacity (not a
// tinted/blended maroon-on-ink block), per the brand-token rule and the
// contrast fix from the previous split-section bug -- cream text on true
// #6E1F24 keeps a clean, easily-verified contrast ratio.
function CareersPlaceholder({ careersRef }) {
  return (
    <div
      ref={careersRef}
      className="mt-16 rounded-[24px] px-8 py-12 md:mt-24 md:px-16 md:py-16"
      style={{ backgroundColor: MAROON }}
    >
      <span
        className="block text-xs uppercase tracking-[0.15em]"
        style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.75 }}
      >
        Careers
      </span>
      <p
        className="mt-4 max-w-2xl text-sm md:text-base"
        style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.9 }}
      >
        [Careers copy pending from client]
      </p>
    </div>
  );
}

export default function ContactContent({ heroPhoto }) {
  const heroRef = useRef(null);
  const formRef = useRef(null);
  const infoRef = useRef(null);
  const careersRef = useRef(null);
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
          [formRef.current, infoRef.current, careersRef.current],
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
          [formRef.current, infoRef.current, careersRef.current],
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

      <section className="w-full px-6 py-16 md:px-16 md:py-24" style={{ backgroundColor: INK }}>
        <div className="mx-auto w-full max-w-[1100px]">
          <div className="grid grid-cols-1 gap-16 md:grid-cols-[1.4fr_1fr]">
            <ContactForm formRef={formRef} />
            <StudioInfo infoRef={infoRef} />
          </div>
          <CareersPlaceholder careersRef={careersRef} />
        </div>
      </section>
    </>
  );
}

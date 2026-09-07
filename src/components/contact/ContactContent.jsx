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

// Matches the standardized section-heading scale from the Phase 3 pass
// (About/Projects/Press all share this).
const HEADING_CLASS = "text-[32px] md:text-[48px]";

const PROJECT_TYPES = ["Residential", "Commercial", "Hospitality", "Other"];

// TODO: real email/phone not yet provided by the client -- do not fabricate
// a plausible-looking number/address, it would be mistaken for real contact
// info. Swap this "coming soon" entry for real values once provided;
// Location mirrors the Instagram bio and is real.
const STUDIO_INFO = [
  { label: "Location", value: "Bangalore, India" },
  { label: "Email & Phone", value: "Coming soon — reach us on Instagram for now" },
];

const INSTAGRAM_URL = "https://instagram.com/studio_sp_ace";

function FieldLabel({ children, optional }) {
  return (
    <span
      className="block text-xs uppercase tracking-[0.15em]"
      style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.65 }}
    >
      {children} {optional ? "(optional)" : "*"}
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

function TextField({ label, optional, ...inputProps }) {
  return (
    <label className="block">
      <FieldLabel optional={optional}>{label}</FieldLabel>
      <input {...inputProps} required={!optional} className={fieldClass} style={fieldStyle} />
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

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="w-full max-w-lg">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <TextField label="Name" type="text" name="name" autoComplete="name" />
        <TextField label="Email" type="email" name="email" autoComplete="email" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <TextField
          label="Phone"
          optional
          type="tel"
          name="phone"
          autoComplete="tel"
        />
        <SelectField
          label="Project Type"
          name="projectType"
          options={PROJECT_TYPES}
          defaultValue=""
        />
      </div>

      <div className="mt-6">
        <TextareaField label="Message" name="message" />
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

export default function ContactContent({ heroPhoto }) {
  const sectionRef = useRef(null);
  const photoRef = useRef(null);
  const headingRef = useRef(null);
  const formRef = useRef(null);
  const infoRef = useRef(null);
  const reduceMotion = useReducedMotion();

  // One-shot reveal, not scroll-scrubbed -- this is a simple content
  // page, not a cinematic section, so it just fades/settles once as it
  // enters the viewport (same pattern as Instagram/Press/Footer after
  // the Phase 3 pass). Still waits for "preloader:complete" since
  // "top 80%" is calculated against this section's own position, which
  // depends on Nav/Preloader having already settled.
  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        // photoRef only renders when heroPhoto is present (see the JSX
        // below) -- guarded the same way IndiaMap.jsx guards its own
        // optional ctaRef, rather than passing a possibly-null entry into
        // gsap's target arrays.
        if (photoRef.current) gsap.set(photoRef.current, { opacity: 0, y: 24 });
        gsap.set(headingRef.current, { opacity: 0, y: 24 });
        gsap.set([formRef.current, infoRef.current], { opacity: 0, y: 24 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });

        if (photoRef.current) {
          tl.to(photoRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0);
        }
        tl.to(headingRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.1);
        tl.to(
          [formRef.current, infoRef.current],
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.1 },
          0.2
        );
      }, sectionRef);

      return () => ctx.revert();
    },
    [],
    !reduceMotion
  );

  return (
    <section
      ref={sectionRef}
      className="w-full px-6 pt-24 pb-16 md:px-16 md:pt-32 md:pb-24"
      style={{ backgroundColor: INK }}
    >
      <div className="mx-auto w-full max-w-[1100px]">
        {/* Hero photo, paired with the heading -- the page's first real
            visual content, stacked above it on mobile and beside it at
            md+. Fixed box + object-cover (this project's standard photo
            treatment, see ProjectsGrid/ProjectHero) rather than the
            photo's own native ~2:3 ratio at full size, so it sits as a
            considered accent alongside the heading instead of pushing the
            form far down the page. */}
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-12">
          {heroPhoto?.src && (
            <div
              ref={photoRef}
              className="relative h-[280px] w-full shrink-0 overflow-hidden rounded-[8px] md:h-[420px] md:w-[300px]"
              style={reduceMotion ? undefined : { opacity: 0 }}
            >
              <CldImage
                src={heroPhoto.src}
                alt={heroPhoto.alt}
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                className="object-cover"
              />
            </div>
          )}

          {/* TODO: placeholder heading + subtext -- pending final copy approval */}
          <div ref={headingRef} style={reduceMotion ? undefined : { opacity: 0 }}>
            <h1
              className={HEADING_CLASS}
              style={{ fontFamily: "var(--font-agatho)", color: CREAM, lineHeight: 1.1 }}
            >
              Let&apos;s Talk
            </h1>
            <p
              className="mt-4 max-w-lg text-sm md:text-base"
              style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.65 }}
            >
              Tell us a little about your project and we&apos;ll get back to you
              to start the conversation.
            </p>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-16 md:mt-20 md:grid-cols-[1.4fr_1fr]">
          <ContactForm formRef={formRef} />
          <StudioInfo infoRef={infoRef} />
        </div>
      </div>
    </section>
  );
}

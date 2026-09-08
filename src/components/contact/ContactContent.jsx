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
// info. Swap this "coming soon" entry for real values once provided. Shared
// as a constant (rather than a literal repeated in two spots) since it also
// backs the "General Inquiries" half of InquiriesSplit below -- one string
// to update once real contact info arrives.
const CONTACT_COMING_SOON = "Coming soon — reach us on Instagram for now";

// Studio Location mirrors the Instagram bio and is real. Labeled "Studio
// Location" (not just "Location") to disambiguate from the form's own
// "Location" field, which asks for the client's project location instead.
const STUDIO_INFO = [
  { label: "Studio Location", value: "Bangalore, India" },
  { label: "Email & Phone", value: CONTACT_COMING_SOON },
];

const INSTAGRAM_URL = "https://instagram.com/studio_sp_ace";

// Backs InquiriesSplit's left-panel stacked entries below. Deliberately a
// separate array from STUDIO_INFO above, not a reuse of it -- the client's
// reference spec for this panel calls the first entry "Studio" (not
// "Studio Location") and wants Instagram as its own stacked entry rather
// than hardcoded separately, so the *shape* differs even though the real
// values are identical to (and sourced from the same constants as)
// STUDIO_INFO/INSTAGRAM_URL above. This means "Bangalore, India" and the
// "coming soon" placeholder now appear twice on this page -- once here,
// once in StudioInfo beside the form higher up. That duplication is
// real and was flagged rather than silently resolved (StudioInfo is out
// of scope for this task); worth a design/content decision later on
// whether StudioInfo should be trimmed once this block exists.
const GENERAL_INQUIRIES_ENTRIES = [
  { label: "Studio", value: "Bangalore, India" },
  { label: "Email & Phone", value: CONTACT_COMING_SOON },
  { label: "Instagram", value: "@studio_sp_ace", href: INSTAGRAM_URL },
];

// Client spec: every field on this form is compulsory, no exceptions --
// there is no longer an "optional" concept here at all. Client also asked
// specifically for a "red asterisk" -- MAROON is the closest brand token to
// that, so the asterisk (only) renders in solid maroon while the label text
// itself stays the usual muted cream.
function FieldLabel({ children }) {
  return (
    <span
      className="block text-xs uppercase tracking-[0.15em]"
      style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.65 }}
    >
      {children} <span style={{ color: MAROON, opacity: 1 }}>*</span>
    </span>
  );
}

// Inline, per-field validation message -- rendered instead of relying on
// the browser's own native `required`/`type=email` popups, which don't
// match this site's styling and (more importantly) fire before React's
// onSubmit ever runs, so they'd pre-empt these custom messages entirely.
// The form itself carries `noValidate` for exactly this reason; `required`
// stays on each control anyway for its screen-reader semantics, paired
// with `aria-invalid`/`aria-describedby` pointing at this element.
function FieldError({ id, error }) {
  if (!error) return null;
  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 border-l-2 pl-2 text-xs"
      style={{ borderColor: MAROON, color: CREAM, opacity: 0.85, fontFamily: "var(--font-manrope)" }}
    >
      {error}
    </p>
  );
}

const fieldClass =
  "mt-2 w-full border-0 border-b bg-transparent pb-2 text-sm focus:outline-none";
const fieldBorderDefault = "rgba(247, 239, 228, 0.3)";
const fieldStyle = {
  borderColor: fieldBorderDefault,
  color: CREAM,
  fontFamily: "var(--font-manrope)",
};

function TextField({ label, name, error, ...inputProps }) {
  const errorId = `${name}-error`;
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input
        {...inputProps}
        name={name}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={fieldClass}
        style={{ ...fieldStyle, borderColor: error ? MAROON : fieldBorderDefault }}
      />
      <FieldError id={errorId} error={error} />
    </label>
  );
}

function SelectField({ label, name, options, error, ...selectProps }) {
  const errorId = `${name}-error`;
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      {/* Callers must pass defaultValue="" (or a controlled value) -- without
          it, browsers skip the disabled placeholder option and auto-select
          the first real option instead, which silently satisfies `required`
          before the user has chosen anything. */}
      <select
        {...selectProps}
        name={name}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={fieldClass}
        style={{ ...fieldStyle, borderColor: error ? MAROON : fieldBorderDefault }}
      >
        <option value="" disabled hidden>
          Select one
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} style={{ color: INK }}>
            {opt}
          </option>
        ))}
      </select>
      <FieldError id={errorId} error={error} />
    </label>
  );
}

function TextareaField({ label, name, error, ...textareaProps }) {
  const errorId = `${name}-error`;
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <textarea
        {...textareaProps}
        name={name}
        required
        rows={4}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`${fieldClass} resize-none`}
        style={{ ...fieldStyle, borderColor: error ? MAROON : fieldBorderDefault }}
      />
      <FieldError id={errorId} error={error} />
    </label>
  );
}

// idle -> submitting -> submitted, or back to idle (with `error` set) on
// any failure so the visitor can fix something and retry without losing
// what they already typed.
const STATUS = { IDLE: "idle", SUBMITTING: "submitting", SUBMITTED: "submitted" };

// Mirrors ContactForm's own `name` attributes/order and the server-side
// list in src/app/api/contact/route.js -- every field is required, no
// exceptions. Kept as its own list (rather than deriving from the JSX)
// so validate() below can run before anything ever touches the network.
const REQUIRED_FIELDS = [
  { name: "name", label: "Name" },
  { name: "email", label: "Email" },
  { name: "phone", label: "Phone" },
  { name: "location", label: "Location" },
  { name: "projectBudget", label: "Project Budget" },
  { name: "projectType", label: "Project Type" },
  { name: "projectDetails", label: "Tell us about your project" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(data) {
  const errors = {};
  for (const { name, label } of REQUIRED_FIELDS) {
    if (!String(data[name] ?? "").trim()) {
      errors[name] = `${label} is required.`;
    }
  }
  if (!errors.email && !EMAIL_RE.test(data.email)) {
    errors.email = "Enter a valid email address.";
  }
  return errors;
}

function ContactForm({ formRef }) {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Clears one field's error as soon as the visitor edits it, rather than
  // leaving a stale "required" message sitting under a field they already
  // fixed until the next full submit attempt re-validates everything.
  const clearFieldError = (name) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(e.currentTarget));

    const errors = validate(data);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError(null);
      // Move focus to the first invalid field, in the form's own field
      // order, so keyboard/screen-reader users land on the first problem
      // instead of having to hunt for it.
      const firstInvalid = REQUIRED_FIELDS.find(({ name }) => errors[name]);
      e.currentTarget.elements[firstInvalid?.name]?.focus();
      return;
    }
    setFieldErrors({});
    setError(null);

    // Frontend-only pass, deliberately: no request is sent yet. A real
    // POST to /api/contact (src/app/api/contact/route.js -- already built,
    // tested, and left untouched here) is a separate follow-up task that
    // will replace just the two lines below with the same async
    // fetch/try-catch shape this file carried before -- on success call
    // setStatus(STATUS.SUBMITTED), on failure call setStatus(STATUS.IDLE)
    // plus setError(message). Nothing about validation, the fields, or the
    // SUBMITTING/error UI needs to change when that lands.
    setStatus(STATUS.SUBMITTING);
    setStatus(STATUS.SUBMITTED);
  };

  if (status === STATUS.SUBMITTED) {
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
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="w-full max-w-lg">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <TextField
          label="Name"
          type="text"
          name="name"
          autoComplete="name"
          error={fieldErrors.name}
          onChange={() => clearFieldError("name")}
        />
        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          error={fieldErrors.email}
          onChange={() => clearFieldError("email")}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <TextField
          label="Phone"
          type="tel"
          name="phone"
          autoComplete="tel"
          error={fieldErrors.phone}
          onChange={() => clearFieldError("phone")}
        />
        <TextField
          label="Location"
          type="text"
          name="location"
          autoComplete="address-level2"
          error={fieldErrors.location}
          onChange={() => clearFieldError("location")}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <TextField
          label="Project Budget"
          type="text"
          name="projectBudget"
          error={fieldErrors.projectBudget}
          onChange={() => clearFieldError("projectBudget")}
        />
        <SelectField
          label="Project Type"
          name="projectType"
          options={PROJECT_TYPES}
          defaultValue=""
          error={fieldErrors.projectType}
          onChange={() => clearFieldError("projectType")}
        />
      </div>

      <div className="mt-6">
        <TextareaField
          label="Tell us about your project"
          name="projectDetails"
          error={fieldErrors.projectDetails}
          onChange={() => clearFieldError("projectDetails")}
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-[4px] px-4 py-3 text-sm"
          style={{ fontFamily: "var(--font-manrope)", color: CREAM, backgroundColor: MAROON }}
        >
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        className="mt-8"
        disabled={status === STATUS.SUBMITTING}
      >
        {status === STATUS.SUBMITTING ? "Sending…" : "Submit Form"}
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
// avoids), Careers copy/link/photo all clearly marked pending real
// content from the client where it is.
function InquiriesSplit({ splitRef, careersPhoto }) {
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
          <span className="block">General</span>
          <span className="block">Inquiries</span>
        </h2>

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

      <div className="flex flex-col" style={{ backgroundColor: MAROON }}>
        <div className="px-8 pt-12 text-center md:px-12 md:pt-16">
          <h2
            className={`${HEADING_CLASS} uppercase`}
            style={{ fontFamily: "var(--font-agatho)", color: CREAM, lineHeight: 1.05 }}
          >
            Careers
          </h2>

          {/* TODO: client to provide real Careers copy -- this supporting
              line is a placeholder, not real content. mx-auto centers the
              max-w-sm box itself (not just the text inside it) now that
              this panel is center-aligned -- without it the box would stay
              flush against the left edge with only its own text centered
              inside that narrower, off-center box. */}
          <p
            className="mx-auto mt-4 max-w-sm text-sm md:text-base"
            style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.85 }}
          >
            [Careers copy pending from client]
          </p>

          {/* TODO: href="#" is a placeholder -- swap for the real
              open-positions page (or a mailto:) once the client provides
              one. Do not fabricate a URL in the meantime. */}
          <a
            href="#"
            className="mt-6 inline-block border-b pb-0.5 text-sm md:text-base"
            style={{ fontFamily: "var(--font-manrope)", color: CREAM, borderColor: CREAM }}
          >
            View open positions
          </a>
        </div>

        {/* Full-bleed within this panel (flush left/right/bottom, no
            padding) -- flex-1 lets it consume whatever height remains
            once the grid stretches this column to match the cream
            panel's height on desktop; a fixed height takes over on
            mobile, where each panel is its own row with no extra space
            to stretch into. TODO: placeholder photo -- swap for the
            client's chosen Careers photo when provided; see the
            CAREERS_PLACEHOLDER_PHOTO comment in contact/page.js for which
            real gallery photo this is and why it was picked. */}
        {careersPhoto?.src ? (
          <div className="relative mt-8 h-56 w-full md:h-auto md:flex-1">
            <CldImage
              src={careersPhoto.src}
              alt={careersPhoto.alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function ContactContent({ heroPhoto, careersPhoto }) {
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
            <ContactForm formRef={formRef} />
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
        <InquiriesSplit splitRef={inquiriesRef} careersPhoto={careersPhoto} />
      </section>
    </>
  );
}

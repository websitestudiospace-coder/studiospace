"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/ui/Button";

// The project enquiry form, shared by the Contact page ("Design With Us")
// and the site-wide Footer -- same fields, same client-side validation,
// same POST to /api/contact, same success popup. Styled cream-on-ink, which
// suits both places (both sit on an INK background).

const CREAM = "#F7EFE4";
const INK = "#2B2622";
const MAROON = "#6E1F24";

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

// py-2.5 (not just pb-2) gives every field a taller tap/focus target on
// mobile -- previously ~29px tall (bottom padding only, no top), under the
// ~44px touch-target guideline. Purely a padding change on a borderless,
// background-less underline field, so it reads as slightly roomier rather
// than visually different.
const fieldClass =
  "mt-2 w-full border-0 border-b bg-transparent py-2.5 text-sm focus:outline-none";
const fieldBorderDefault = "rgba(247, 239, 228, 0.3)";
const fieldStyle = {
  borderColor: fieldBorderDefault,
  color: CREAM,
  fontFamily: "var(--font-manrope)",
};

function TextField({ label, name, idPrefix, error, ...inputProps }) {
  const errorId = `${idPrefix}${name}-error`;
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

function SelectField({ label, name, idPrefix, options, error, ...selectProps }) {
  const errorId = `${idPrefix}${name}-error`;
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

function TextareaField({ label, name, idPrefix, error, ...textareaProps }) {
  const errorId = `${idPrefix}${name}-error`;
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

// `submitVariant` lets each host keep its own button style (the Contact
// page's filled "primary", the Footer's underlined "text"). The useId()
// prefix keeps each instance's error-message ids unique, since the Contact
// page renders this form twice (its own section plus the Footer's).
export default function ContactForm({ formRef, submitVariant = "primary" }) {
  const idPrefix = useId();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Captured up front: the browser nulls out e.currentTarget once the
    // event finishes dispatching, i.e. at the first `await` below. Calling
    // e.currentTarget.reset() after the fetch threw a TypeError, so every
    // successful send (email already delivered) fell into the catch and
    // told the visitor it had failed.
    const form = e.currentTarget;

    const data = Object.fromEntries(new FormData(form));

    const errors = validate(data);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError(null);
      // Move focus to the first invalid field, in the form's own field
      // order, so keyboard/screen-reader users land on the first problem
      // instead of having to hunt for it.
      const firstInvalid = REQUIRED_FIELDS.find(({ name }) => errors[name]);
      form.elements[firstInvalid?.name]?.focus();
      return;
    }
    setFieldErrors({});
    setError(null);
    setStatus(STATUS.SUBMITTING);

    // Real POST to /api/contact (src/app/api/contact/route.js), re-wired
    // after the twentieth session's deliberate frontend-only pass. Server
    // re-validates independently -- this call can still come back with a
    // 400/500 (e.g. SMTP unconfigured), which surfaces as the same inline
    // `error` banner a client-side validation failure would, not a crash.
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await res.json().catch(() => null);

      if (res.ok && payload?.ok) {
        // Client request (2026-09-21): confirmation should be a popup, not
        // a screen that replaces the form -- the form now stays on screen
        // (and clears itself via e.currentTarget.reset(), captured before
        // this async gap since React pools/clears synthetic events) so the
        // visitor can immediately send a second message if they want to,
        // rather than the whole form vanishing behind a "thanks" message.
        form.reset();
        setStatus(STATUS.SUBMITTED);
      } else {
        setStatus(STATUS.IDLE);
        setError(payload?.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus(STATUS.IDLE);
      setError(
        "Something went wrong sending your message. Please try again or reach out via Instagram."
      );
    }
  };

  // Field order below is the client's exact spec, verbatim from the
  // recorded walkthrough: name, email, phone, location, project budget,
  // project type, then the project-description textarea last. Every field
  // is compulsory (see FieldLabel/TextField above) -- phone in particular
  // used to be marked optional here and no longer is.
  return (
    <>
    {status === STATUS.SUBMITTED ? (
      <SuccessPopup onClose={() => setStatus(STATUS.IDLE)} />
    ) : null}
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="w-full max-w-lg">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <TextField
          idPrefix={idPrefix}
          label="Name"
          type="text"
          name="name"
          autoComplete="name"
          error={fieldErrors.name}
          onChange={() => clearFieldError("name")}
        />
        <TextField
          idPrefix={idPrefix}
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
          idPrefix={idPrefix}
          label="Phone"
          type="tel"
          name="phone"
          autoComplete="tel"
          error={fieldErrors.phone}
          onChange={() => clearFieldError("phone")}
        />
        <TextField
          idPrefix={idPrefix}
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
          idPrefix={idPrefix}
          label="Project Budget"
          type="text"
          name="projectBudget"
          error={fieldErrors.projectBudget}
          onChange={() => clearFieldError("projectBudget")}
        />
        <SelectField
          idPrefix={idPrefix}
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
          idPrefix={idPrefix}
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
        variant={submitVariant}
        className="mt-8"
        disabled={status === STATUS.SUBMITTING}
      >
        {status === STATUS.SUBMITTING ? "Sending…" : "Submit Form"}
      </Button>
    </form>
    </>
  );
}

// Centered modal popup shown on successful submit, in place of the old
// "form disappears, thank-you text takes its place" behavior (client
// request, 2026-09-21). Fixed/full-viewport overlay so it reads clearly as
// a popup regardless of where the form sits on the page; z-[200] clears
// Nav's own z-[100] (see MeetFounders.jsx's STICKY_COLUMN_TOP_PX comment
// for that same fixed-Nav reference point). Auto-dismisses after 6s but
// also closable immediately, for anyone who wants to keep reading the page
// right away rather than waiting it out.
//
// Portaled to <body>: the form's hosts animate their wrappers in with GSAP
// transforms (e.g. the Footer's signup block), and a transformed ancestor
// becomes the containing block for `position: fixed` -- without the portal
// the overlay was sized to the footer block instead of the viewport, and
// the card sat half-hidden under the Nav. Only ever mounted client-side
// (after a submit), so `document` is always available here.
function SuccessPopup({ onClose }) {
  // This component only exists while status === SUBMITTED, so it mounts
  // fresh each time it appears -- a plain mount-effect timer is enough,
  // no ref/guard needed. Cleanup clears the timer if onClose already fired
  // (the close button) before the 6s auto-dismiss would have.
  useEffect(() => {
    const id = setTimeout(onClose, 6000);
    return () => clearTimeout(id);
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Message sent"
      className="fixed inset-0 z-[200] flex items-center justify-center px-6"
      style={{ backgroundColor: "rgba(43,38,34,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[8px] px-8 py-10 text-center"
        style={{ backgroundColor: CREAM }}
        onClick={(e) => e.stopPropagation()}
      >
        <p
          className="text-xl"
          style={{ fontFamily: "var(--font-agatho)", color: INK }}
        >
          Thanks, we&apos;ll be in touch.
        </p>
        <p
          className="mt-3 text-sm"
          style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.65 }}
        >
          We&apos;ve received your message and will get back to you shortly.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 inline-block border-b pb-0.5 text-sm uppercase tracking-[0.15em]"
          style={{ fontFamily: "var(--font-manrope)", color: MAROON, borderColor: MAROON }}
        >
          Close
        </button>
      </div>
    </div>,
    document.body
  );
}


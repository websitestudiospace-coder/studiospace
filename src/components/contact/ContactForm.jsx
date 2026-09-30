"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/ui/Button";

// The project enquiry form, shared by the Contact page and the Footer: same
// fields, validation, POST to /api/contact and success popup.

const CREAM = "#F7EFE4";
const INK = "#2B2622";
const MAROON = "#6E1F24";

// "Residential" sub-types flattened into individually selectable options.
const PROJECT_TYPES = [
  "Residential – New Build",
  "Residential – Remodel",
  "Commercial",
  "Hospitality",
  "Others",
];

// Every field is required; the asterisk is maroon (the client asked for a
// red one).
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

// Inline per-field error. The form uses `noValidate` so the browser's own
// popups don't pre-empt these; `required` stays on each control for screen
// readers, alongside aria-invalid/aria-describedby.
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

// py-2.5 keeps each field a comfortable ~44px touch target.
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
      {/* Callers must pass defaultValue="" (or a controlled value); otherwise
          the browser auto-selects the first real option and silently
          satisfies `required`. */}
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

// idle -> submitting -> submitted, or back to idle with `error` set so the
// visitor can fix things without losing what they typed.
const STATUS = { IDLE: "idle", SUBMITTING: "submitting", SUBMITTED: "submitted" };

// Must match the fields' `name`s and the server-side list in
// src/app/api/contact/route.js.
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

// `submitVariant` lets each host keep its own button style. useId() keeps
// error ids unique when the form renders twice (Contact page + Footer).
export default function ContactForm({ formRef, submitVariant = "primary" }) {
  const idPrefix = useId();
  const [status, setStatus] = useState(STATUS.IDLE);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Clear a field's error as soon as it's edited.
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
    // Captured before the first `await`: the browser nulls e.currentTarget
    // after dispatch, and reset() on null made successful sends look failed.
    const form = e.currentTarget;

    const data = Object.fromEntries(new FormData(form));

    const errors = validate(data);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError(null);
      // Focus the first invalid field for keyboard/screen-reader users.
      const firstInvalid = REQUIRED_FIELDS.find(({ name }) => errors[name]);
      form.elements[firstInvalid?.name]?.focus();
      return;
    }
    setFieldErrors({});
    setError(null);
    setStatus(STATUS.SUBMITTING);

    // The server re-validates; a 400/500 (e.g. SMTP not configured) shows as
    // the same inline error banner.
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await res.json().catch(() => null);

      if (res.ok && payload?.ok) {
        // Success shows a popup and clears the form, so a second message
        // can be sent straight away.
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

  // Field order is the client's spec: name, email, phone, location, budget,
  // project type, then details. All required.
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

// Success popup. z-[200] sits above the Nav (z-[100]). Auto-dismisses after
// 6s, or closes immediately via the button.
//
// Portaled to <body>: hosts animate their wrappers with GSAP transforms, and
// a transformed ancestor becomes the containing block for `position: fixed`
// (the overlay would size to that wrapper instead of the viewport).
function SuccessPopup({ onClose }) {
  // Mounts fresh on each success, so a plain mount-effect timer is enough.
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


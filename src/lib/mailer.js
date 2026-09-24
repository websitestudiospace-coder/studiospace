import nodemailer from "nodemailer";

// SMTP setup for the site's form routes (currently just /api/contact, which
// both the Contact page form and the Footer form post to) -- one place for
// the env vars and transporter config if another route ever needs it.
//
// Returns null when SMTP isn't configured. The caller logs that under its
// own route name and returns its own visitor-facing message; which env var
// is missing is internal deployment detail, never shown to a visitor.
export function getMailer() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } =
    process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !CONTACT_TO_EMAIL) {
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return {
    transporter,
    from: CONTACT_FROM_EMAIL || SMTP_USER,
    to: CONTACT_TO_EMAIL,
  };
}

export const SMTP_NOT_CONFIGURED_LOG =
  "SMTP is not configured -- set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and CONTACT_TO_EMAIL in .env.local (see .env.example).";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

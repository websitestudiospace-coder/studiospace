import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { EMAIL_RE, SMTP_NOT_CONFIGURED_LOG, escapeHtml, getMailer } from "@/lib/mailer";

// Must match ContactForm's `name` attributes and field order in
// ContactContent.jsx exactly -- this is the server-side mirror of that
// form's required-field list, since a direct POST can skip the browser's
// own `required` validation entirely. `maxLength` caps abuse (a scripted
// submission padding a field with megabytes of text) -- generous enough
// that no real visitor could ever hit it.
const FIELDS = [
  { key: "name", label: "Name", maxLength: 200 },
  { key: "email", label: "Email", maxLength: 200 },
  { key: "phone", label: "Phone", maxLength: 50 },
  { key: "location", label: "Location", maxLength: 200 },
  { key: "projectBudget", label: "Project Budget", maxLength: 100 },
  { key: "projectType", label: "Project Type", maxLength: 100 },
  { key: "projectDetails", label: "Tell us about your project", maxLength: 5000 },
];

export async function POST(request) {
  const ip = getClientIp(request);
  const { limited, retryAfterSeconds } = checkRateLimit(ip);
  if (limited) {
    return NextResponse.json(
      { ok: false, error: "Too many submissions. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const missing = FIELDS.filter(({ key }) => !String(body?.[key] ?? "").trim()).map(
    ({ label }) => label
  );
  if (missing.length > 0) {
    return NextResponse.json(
      { ok: false, error: `Please fill in: ${missing.join(", ")}.` },
      { status: 400 }
    );
  }

  const tooLong = FIELDS.filter(
    ({ key, maxLength }) => String(body[key]).trim().length > maxLength
  ).map(({ label }) => label);
  if (tooLong.length > 0) {
    return NextResponse.json(
      { ok: false, error: `Please shorten: ${tooLong.join(", ")}.` },
      { status: 400 }
    );
  }

  const data = Object.fromEntries(
    FIELDS.map(({ key }) => [key, String(body[key]).trim()])
  );

  if (!EMAIL_RE.test(data.email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  // Never tell the client which specific env var is missing -- that's
  // internal deployment detail, not something a site visitor should see.
  // The real reason goes to the server log only.
  const mailer = getMailer();
  if (!mailer) {
    console.error(`[/api/contact] ${SMTP_NOT_CONFIGURED_LOG}`);
    return NextResponse.json(
      {
        ok: false,
        error:
          "This form isn't able to send email right now. Please reach out via Instagram in the meantime.",
      },
      { status: 500 }
    );
  }

  const textBody = FIELDS.map(({ key, label }) => `${label}: ${data[key]}`).join("\n");
  const htmlBody = `<table cellpadding="4" cellspacing="0">${FIELDS.map(
    ({ key, label }) =>
      `<tr><td><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(data[key]).replace(
        /\n/g,
        "<br>"
      )}</td></tr>`
  ).join("")}</table>`;

  try {
    await mailer.transporter.sendMail({
      from: mailer.from,
      to: mailer.to,
      replyTo: data.email,
      subject: `New project enquiry from ${data.name}`,
      text: textBody,
      html: htmlBody,
    });
  } catch (err) {
    // A failed send would otherwise lose the enquiry entirely -- the only
    // record was the technical error, not what the visitor actually wrote.
    // Logging the submission itself alongside the error means whoever
    // checks server logs can still manually follow up on a lost lead,
    // without standing up a full retry/queue system for a failure mode
    // this rare.
    console.error("[/api/contact] sendMail failed:", err);
    console.error("[/api/contact] lost enquiry, recover manually:", JSON.stringify(data));
    return NextResponse.json(
      {
        ok: false,
        error:
          "Something went wrong sending your message. Please try again or reach out via Instagram.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}

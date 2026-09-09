# Studio SP_ACE — System Design Audit

Audited 2026-09-09 against a standard system-design checklist. **Scope check first:** this is a marketing/portfolio site for a two-person interior design studio — Next.js App Router, one real backend endpoint (`/api/contact`), no user accounts, no database, no multi-tenant data. Several checklist categories don't meaningfully apply at this size; those are marked **N/A** with a note on what would be needed if the project ever outgrew this scale, rather than padded with speculative infrastructure. Where a "standard" audit would push infrastructure this project doesn't need, that's flagged as its own finding under §14.

Severity scale: **Critical** (exploitable/production-breaking) → **High** (real, likely risk at this project's actual usage) → **Medium** (real gap, not urgent) → **Low** (hygiene/nice-to-have) → **N/A** (out of scope at this scale, reasoning given).

---

## 1. System design & architecture

**File structure — coherent.** `src/app/` (routes) → `src/components/<section>/` (about, contact, home, legal, media, projects, shared, ui) → `src/data/` (static content) → `src/lib/` (Cloudinary/project resolution) → `src/hooks/` (2 shared hooks) → `scripts/` (build-time tooling, checked into git). One route ↔ one page composition ↔ section-scoped components. No ambiguity about where a new file goes. **Low** — no action needed.

**Data source of truth — mostly one clear owner per concern:**
- Project data: `src/data/projects.js` (roster) + `scripts/photo-manifest.json` (photos/order/dimensions) + `scripts/cloudinary-url-map.json` (URL resolution), combined by `src/lib/projects.js`. Well-documented, single resolution path. **Low.**
- Press data: `src/data/press.js`, shared by both the home carousel and `/media`'s grid — this used to be duplicated (per `PROJECT_STATUS.md`) and was already fixed. **N/A** (already resolved).
- **Finding — data duplication, unresolved:** `ContactContent.jsx`'s `StudioInfo` sidebar and its `InquiriesSplit` block both hardcode the same studio location/email-phone/Instagram values from two separate literals in the same file. This was flagged as a known issue in a prior session and deliberately left alone at the time (scope reasons), but it's still live today — a future content change (e.g. a real phone number) has two places to update and no compiler/lint check that they'd stay in sync. **Medium.** Fix: extract one `STUDIO_INFO` constant both blocks read from.

**Components doing too much:**
- `ContactContent.jsx` — **717 lines**, the largest component in the codebase by a wide margin (next-largest is 544). It's grown to own: the page hero, the 7-field form + its validation state machine, the studio-info sidebar, and the `InquiriesSplit` (General Inquiries/Careers) block — four fairly distinct concerns in one file, confirmed by the session history in `PROJECT_STATUS.md` showing over a dozen separate edits to this one file across different sub-sections. **Medium.** Fix: split into `ContactHero.jsx`, `ContactForm.jsx`, `StudioInfo.jsx`, `InquiriesSplit.jsx` — pure extraction, no behavior change, would also resolve the duplication finding above by giving the shared data one obvious home.
- `WhatWeBelieve.jsx` — 432 lines, third-largest. Less severe than `ContactContent` (single conceptual section, one animation timeline), but worth a look if it's touched again. **Low.**

---

## 2. Frontend

**"use client" usage:** all 31 component files are client components (31/31). For a site this animation-heavy (GSAP + ScrollTrigger + Lenis on nearly every section) that's largely justified rather than wasteful — but it does mean the framework gets no free server-rendering win on any component-level boundary; only `page.js` files for `/privacy`, `/terms`, and `/projects` stay server components. **Low** — not clearly wrong given the design language, but if a future purely-presentational subcomponent (no hooks, no animation) gets added, it should default to server.

**Image optimization:** `CldImage`/`next/image` used consistently (22 usages, matching alt coverage), `next.config.mjs` tunes `images.qualities` to `[75, 90]` specifically because `AboutHero.jsx` needs `quality={90}`. Cloudinary handles the actual CDN/transform layer. **Low** — no gap found.

**Font loading:** Agatho self-hosted via `next/font/local`, Manrope via `next/font/google` — both go through Next's font optimization (no render-blocking `<link>`, no CLS from web-font swap). **Low.** Housekeeping only: `src/fonts/` still has 6 unused font files (`corporate-regular.otf`, 4 `juana-*` variants, `Agatho_ RegularCAPS.otf`) not referenced by `layout.js` — zero runtime cost since they're never loaded, but dead weight in the repo. **Low.**

**Bundle size per route:** not measured in this pass — no `@next/bundle-analyzer` is configured and Phase 1 is code-only (no dev server / build introspection run). **Medium** — recommend running `next build` and reading its route-size output (or adding the analyzer) before/after the Phase 2 fixes, since GSAP + Lenis + next-cloudinary are non-trivial dependencies pulled into nearly every route.

**Accessibility spot-check (from source, not a live browser pass — see caveat below):**
- Alt text: present on effectively every image usage; the one `alt=""` (`Instagram.jsx`) reads as a deliberate decorative-image call, not an oversight.
- Contact form: real inline `role="alert"` validation errors per field (confirmed in `PROJECT_STATUS.md`'s twentieth-session entry), maroon-asterisk required-field marking, disabled+labeled submit state during submission — all accessibility-conscious patterns already in place.
- Focus states / keyboard nav on the nav menu and form: **not independently re-verified in this pass.** Phase 1 was scoped to zero code changes and static analysis; a live keyboard-only pass through the mobile hamburger overlay and the contact form's tab order would need an actual browser session (this project's own established QA method, per its history) to confirm rather than infer from JSX. **Low-Medium, flagged as an open verification gap** rather than a confirmed defect — recommend a real Playwright/keyboard pass next time either surface is touched.

---

## 3. APIs & backend logic — `/api/contact/route.js`

- **Input validation:** required-field presence + trim check (server-side, doesn't trust the browser's own `required` attributes — correct, since a direct POST can skip that entirely), plus a real email-format regex. **Good.**
- **Gap — no length limits.** None of the 7 fields (including free-text `projectDetails`) has a max-length check, client or server side (confirmed via grep — no `maxLength` anywhere in `ContactContent.jsx`, nothing in the route). A malicious or scripted submission could send megabytes of text per field, inflating the resulting email and, combined with the rate-limiting gap below, the abuse surface. **Medium.** Fix: cap each field (e.g. 200 chars for name/email/phone/location/budget, ~5000 for the free-text field) and reject over-length submissions with the same 400 shape already used for missing fields.
- **Error handling:** try/catch around JSON parsing and around `sendMail`; real errors go to `console.error` server-side only, generic messages go to the client — correct instinct (doesn't leak deployment details), but see §11/§12 for what happens to that `console.error` in production. **Good, with the logging gap noted separately.**
- **Response shape consistency:** every path returns `{ ok: boolean, error?: string }` with an appropriate status code (400/500/502/200) — consistent, easy for the client's `handleSubmit` to branch on. **Good.**
- **Abuse surface:** see §9 — no rate limiting is the dominant real risk here, not the validation logic itself.
- **HTML-email injection:** `escapeHtml()` is applied to every field before building the HTML email body — correctly prevents a submitted value like `<script>` or `<img onerror=...>` from executing in whatever mail client renders it. **Good.**

---

## 4. Databases & storage

**N/A — no database.** Content is static/file-based (`src/data/*.js`, `scripts/*.json`), which is the right call at this project's size — nothing here needs concurrent-write handling, migrations, or a query layer. If this ever grew a CMS-driven content model (e.g. non-developer content edits, or an admin panel), that's when a lightweight headless CMS or a database would earn its complexity — not before.

**Cloudinary (the only real "storage" dependency):** credentials handled correctly — `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is the only Cloudinary value exposed client-side (by design; it's not a secret, just a namespace), and `CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET` are read only by `scripts/upload-to-cloudinary.js`, a local/CI-only script, never bundled into client code (confirmed via grep — those two vars appear nowhere under `src/`). **Low** — correctly scoped, no finding.

---

## 5. Auth & permissions

**N/A — no login system, no user accounts, no admin panel exists anywhere in this codebase.** Confirmed: no auth libraries in `package.json`, no `/login`/`/admin` routes, no session/cookie handling in `src/`. Nothing to audit here. If a future admin panel (e.g. for editing project data without a code change) gets built, that's the point to add real auth (NextAuth/Clerk/etc.) and a permissions model — inventing one now would be pure speculative infrastructure for a two-person studio site with no content-management users.

---

## 6. Hosting & cloud

Client's decided target is **Hostinger** (Business plan, Node-capable). Checked for Vercel-only assumptions:
- No `@vercel/*` packages in `package.json`. **Good.**
- No `export const runtime = "edge"` (or any edge-runtime-only API) anywhere in `src/` (grepped). The app is plain Node-server-shaped (`next start`), which is exactly what Hostinger's Node hosting expects — no rewrite needed to leave Vercel. **Good.**
- No `process.env.VERCEL*` reads anywhere in application code. **Good.**
- `next.config.mjs` is minimal (`devIndicators`, `images.qualities`) — nothing platform-specific. **Good.**

**One real open risk, not verifiable from code:** Next.js 16.3.0 has a real minimum Node.js version requirement, and Hostinger's Business-plan Node hosting tier's available Node version isn't confirmed anywhere in this repo or its docs. **High, but a verify-not-fix item** — confirm Hostinger's available Node runtime version supports Next 16 *before* the actual deploy, since a mismatch would be discovered at the worst possible time (go-live), not gradually.

---

## 7. CI/CD & version control

**Git history re-verified as real and intact.** `.git` exists, `git log` shows 20 real commits with descriptive messages matching the actual session history documented in `PROJECT_STATUS.md`/`brain.md` — no evidence of history rewriting or fabrication (this project's local git setup was apparently in question before; that concern doesn't hold up on re-check). Working tree is clean. **Low** — no action needed, just confirming the prior concern is resolved.

**No CI exists** — `.github/workflows/` doesn't exist. Every `lint`/`build` check in this project's history has been run manually, per-session, by whoever (human or Claude Code) was working at the time. **Medium.** A minimal gate would be: on every push/PR, run `npm ci && npm run lint && npm run build` — catches a broken build or a new lint error before it reaches `master`, costs nothing to run (no test suite to slow it down yet), and is a ~15-line YAML file. Not proposing a full deploy pipeline (no staging environment exists to deploy to) — just the lint+build gate.

---

## 8. Security

**`npm audit` — 1 critical, 2 high:**
| Package | Severity | Issue | Fix |
|---|---|---|---|
| `next` (16.3.0, direct dependency) | **Critical** | Unauthenticated RCE on Windows-hosted servers (path traversal, CVSS 9.0) + a second unauthenticated RCE in the image-optimization API for AVIF files | Upgrade to `next@16.3.4`, no major-version bump needed |
| `sharp` (transitive) | High | libheif memory-corruption CVEs | `npm audit fix` resolves it |
| `js-yaml` (transitive) | High | CPU-exhaustion via merge keys | `npm audit fix` resolves it |

This is the single most urgent finding in the entire audit — a critical, unauthenticated RCE in the exact framework this site runs on, with a drop-in fix already available. **Critical.**

**Secrets hygiene — clean.** `.gitignore` covers `.env*` with a `!.env.example` carve-out; `git log --all -- .env.local` returns nothing (never committed); `git check-ignore -v .env.local` confirms it's actively ignored today. Grepped `src/` and `scripts/` for hardcoded credential-shaped strings (`api_key=`, `secret=`, `password=`, `token=` followed by a long literal) — zero matches. **Low** — no action needed.

**Security headers — absent.** `next.config.mjs` defines no `headers()` function at all — no CSP, no `X-Frame-Options`, no `X-Content-Type-Options`, no `Referrer-Policy`, no `Strict-Transport-Security`. **High.** Fix: add a `headers()` block to `next.config.mjs` with a baseline set (`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a reasonably permissive CSP that allows Cloudinary/Google Fonts/Google Maps embed sources, and HSTS once the real production domain + HTTPS is confirmed on Hostinger).

---

## 9. Rate limiting

**None on `/api/contact`.** Confirmed by reading the full route — no IP tracking, no request counting, no delay/backoff of any kind. This is a concrete, realistic risk for this specific app: a bot or a single malicious script could hit this endpoint in a loop and either exhaust the Gmail account's daily sending quota (breaking the form for real visitors) or generate enough send attempts to get the sending Gmail account flagged/throttled by Google. **High**, exactly as scoped. Fix: a simple in-memory IP+timestamp limiter (e.g. N requests per IP per time window, reset on interval) is sufficient at this traffic scale — no Redis, no external rate-limiting service needed; a single Node process behind Hostinger doesn't need distributed state for this.

---

## 10. Caching & CDN

**Image CDN:** already fully handled by Cloudinary (transforms, caching, delivery) — no gap.

**Static-asset caching in `next.config.mjs`:** no custom `headers()` override exists for `public/`-served assets, so Next's own defaults apply. This is actually the *correct* current state, not a gap — per prior guidance already on record for this project, `public/` assets like the logo/hero/founder photos get swapped in place frequently enough that long-lived `immutable` caching would be actively wrong here (visitors would keep seeing stale images); the current default (no override → normal revalidation) is the right tradeoff already in effect. **N/A** — matches a deliberate prior decision, not an oversight.

**Hostinger CDN layer:** Hostinger's Business-plan hosting is not confirmed (from this repo) to include an edge CDN the way Vercel's platform does natively. Since Cloudinary already carries the heavy asset traffic (all project photography/video), the exposure is limited to HTML/JS/CSS delivery from a single origin. **Medium, forward-looking only** — not an issue at current traffic; if traffic grows meaningfully post-launch, fronting Hostinger with Cloudflare (or confirming Hostinger's own CDN add-on) would be the next step, not something needed today.

---

## 11. Error tracking & logs

**Currently: `console.error` only, in `/api/contact/route.js`, nothing else in the codebase does structured logging.** No Sentry, no equivalent. This is a realistic gap for a production business site with real backend logic now (the contact form's email send): if `sendMail` throws in production, the *only* record is a line in whatever log Hostinger's Node process writes, which nobody is set up to watch. **Medium** — matches the task's own framing exactly. A lightweight fix (Sentry's free tier, or even a second-channel failure notification — see §12/Phase 2 item 4) would close this without building a full observability stack.

---

## 12. Monitoring & alerts

**None currently — no uptime monitoring, no alerting of any kind.** Real, concrete gap: if Gmail SMTP starts rejecting the app's credentials (expired app password, quota, account flag) in production, the contact form would silently fail for every visitor from that point forward, and nobody would know until a prospective client complained about never hearing back — for a design studio, a lost lead is a real business cost, not an abstract risk. **Medium-High** in impact even though the underlying cause is likely rare. A minimal fix doesn't need PagerDuty-grade infrastructure: a free uptime check (e.g. UptimeRobot) against `/`, plus the error-visibility fix in §11/Phase 2 item 4, covers the realistic failure modes at this scale.

---

## 13. Testing

**No automated tests exist.** Confirmed: no test files anywhere in the repo (`find` for `*.test.*` / `*spec*` returns nothing outside `node_modules`), no test framework (`vitest`, `jest`, `@playwright/test`, `@testing-library/*`) in `package.json`. This project's actual QA process has been manual, ad hoc Playwright/browser verification per work session (well-documented in `PROJECT_STATUS.md`'s session log), never persisted as a runnable suite.

**Is that an acceptable tradeoff?** For the marketing pages (About, Projects, Media, legal) — yes, reasonably; they're static content with low change-risk, and a persisted suite for pages that mostly get copy/layout tweaks has real maintenance cost of its own. **Low** for those.

**For the contact form specifically — no longer just cosmetic risk.** It now has a real backend (SMTP email send) that's the studio's actual lead-generation path; a regression here (a future edit accidentally breaking `handleSubmit`, or the validation logic) would silently cost the business real inquiries, and per §11/§12 nobody would necessarily notice quickly. **Medium.** A minimal smoke suite — one Playwright test that fills and submits the real form against a test SMTP config (or mocks `nodemailer`), one test per critical page confirming it renders and has no console errors — would be proportionate here, not a full test pyramid.

---

## 14. Scaling

**N/A at current scale.** A boutique studio's marketing site does not need horizontal scaling, load balancing, or multi-region deployment — traffic is bursty at best (a client review, a press mention), never sustained at a level a single Node process on Hostinger couldn't handle. If this project's scope ever changed materially (e.g. genuine high-traffic press coverage, or a pivot to a lead-gen-heavy product), the two things that would actually matter are already half-solved: image/media delivery already scales via Cloudinary regardless of origin traffic, and the Node hosting tier itself would need review at that point (not before).

**Over-engineering flag (per this audit's own brief):** a checklist-literal audit of this project would be tempted to recommend a database for "future content flexibility," a full auth system "in case an admin panel is needed later," Redis-backed distributed rate limiting, and a full observability stack (Sentry + Datadog + PagerDuty). All four would be real, working infrastructure with **no current job to do** on a two-person studio's marketing site with one backend endpoint — they're listed here explicitly as findings *against* recommending them, not omissions. The fixes in this report (§8 headers, §9 rate limiting, §11 basic logging) are deliberately the smallest version of each that actually closes the real risk.

---

## Prioritized punch list

**Critical**
1. `npm audit` — upgrade `next` to `16.3.4`+ to close an unauthenticated critical RCE (§8).

**High**
2. Add rate limiting to `/api/contact` — simple in-memory IP+time-window limiter (§9).
3. Add baseline security headers to `next.config.mjs` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, CSP, HSTS) (§8).
4. Resolve remaining `npm audit` high findings (`sharp`, `js-yaml`) via `npm audit fix` (§8).
5. Confirm Hostinger's Node.js runtime version supports Next.js 16 before deploy — verification, not a code fix (§6).
6. Add field length limits to `/api/contact`'s validation (bundle with the rate-limiting fix) (§3).

**Medium**
7. Add a minimal CI gate (`lint` + `build` on push/PR) — no `.github/workflows/` currently exists (§7).
8. Close the error-visibility gap for contact-form backend failures — beyond `console.error` (§11, §12).
9. Add a free uptime check against the live site so an SMTP outage doesn't fail silently (§12).
10. Split `ContactContent.jsx` (717 lines, 4 concerns) into separate component files (§1).
11. Deduplicate `STUDIO_INFO`-shaped data currently hardcoded twice inside `ContactContent.jsx` (§1).
12. Add a minimal smoke-test suite covering the contact form's real submit path + critical pages (§13).
13. Measure actual per-route bundle size (`next build` output or bundle analyzer) (§2).

**Low**
14. Delete unused font files in `src/fonts/` (§2).
15. Re-verify focus states / keyboard nav on the nav menu and contact form via a live browser pass (§2).
16. Consider `WhatWeBelieve.jsx` (432 lines) for a lighter split if it's touched again (§1).

**N/A (documented, no action needed)**
- Databases & storage — static/file-based content is correct at this size (§4).
- Auth & permissions — no accounts/admin panel exists to secure (§5).
- Caching headers for `public/` assets — current default already matches the deliberate no-immutable-caching decision (§10).
- Horizontal/complex scaling — not a real constraint at current traffic (§14).

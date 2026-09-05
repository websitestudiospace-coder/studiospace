# Studio SP_ACE — Project Status (Session Handoff)

**Reflects state as of 2026-09-05, end of session.** This is a point-in-time snapshot for continuing this project in a fresh chat — it covers CURRENT STATE and IN-PROGRESS work. For architecture, locked conventions, and rules (golden rule, sticky-vs-pin, motion vocabulary, brand tokens, media pipeline), see `brain.md` instead — don't duplicate that here.

**Before relying on anything below:** a fresh session should spot-check against the live code, not trust this file blindly. This file went through several rounds of drift earlier in this same session (work landing without the file being updated, then getting reconciled) — everything below was re-verified against actual current code, `git log`, and live Playwright checks at the end of the session, not carried forward from earlier drafts of this file.

---

## 1. Current site structure (verified 2026-09-05)

- `/` — `Nav → HeroQuoteTransition → Quote → About → Projects → Instagram → Press → Footer`
- `/about` — `Nav(lightHero) → AboutHero → MeetFounders → WhatWeBelieve → IndiaMap → Footer` (no `StudioDescription`, no `FinalCTA` — both removed, see §2)
- `/contact` — `Nav → ContactContent → ContactLocationMap → Footer`
- `/projects` — `Nav → ProjectsHero → ProjectsGrid → Footer`
- `/projects/[slug]` — `Nav → ProjectHero → ProjectGallery → ProjectVideo (conditional) → NextProjectLink → Footer`
- Global chrome (in `src/app/layout.js`, outside any page): `Preloader`, `ScrollProgress`, `SmoothScroll` (Lenis wrapper)

---

## 2. What was completed this session (2026-09-05), most recent first

### Reconciliation fix: India map now shared with Contact page too
A batch of prior instructions asked for the About page's Google Maps embed to be extracted into a shared component and reused (map-only) on Contact — this hadn't actually landed; Contact was still on the old label-position layout. Fixed:
- `src/components/shared/IndiaMapEmbed.jsx` — just the sizing wrapper + grayscale-filtered iframe, no heading/caption/CTA.
- `src/components/about/IndiaMap.jsx` — wraps it with About's heading/caption/CTA/reveal timeline.
- `src/components/contact/ContactLocationMap.jsx` (new) — wraps it map-only with a simple one-shot fade-in, rendered in `contact/page.js` between `ContactContent` and `Footer`.
- Old `src/components/shared/LocationsMap.jsx` (the label-position layout) deleted — confirmed via `grep` it had no other usage.
- Contact page now has two distinct, legitimate map embeds: `ContactContent.jsx`'s own precise "Find Us" embed (specific address `pb=...` URL) and this India-wide service-area overview. Not a duplicate.

### "Where We Work" / `IndiaMap.jsx` — now a real Google Maps embed (third direction change)
History: `react-simple-maps`/TopoJSON concentric-circle map (disliked, fully removed incl. `npm uninstall react-simple-maps`) → a minimalist Yodezeen-style label-position layout (disliked) → **current: a real keyless Google Maps iframe**, grayscale-filtered.
- Embed: `https://www.google.com/maps?q=Bangalore,India&z=4&output=embed` — no API key.
- **Zoom tuning (confirmed via multiple rendered screenshots):** `z=5` cropped off all of northern India (map centers on Bangalore, ~12.9°N, far south of India's own north-south midpoint). A fractional `z=4.5` is **rejected outright by Google's server** (confirmed via a live 400 response — keyless embeds only accept integer zoom). Landed on `z=4` + a taller box (`h-[55vh] md:h-[75vh]`, up from `45vh`/`60vh`) — the real fix for "too much surrounding country" was the box's aspect ratio, not the zoom number.
- **Custom Bangalore marker overlay — added, then removed same day.** Its CSS position exactly matched the iframe's own center (confirmed via `getBoundingClientRect()`), but in a real browser it rendered over open ocean near Somalia/Kenya, nowhere near Bangalore. A keyless embed exposes no way to read its actual live center/pan/zoom state from outside, so there's no reliable way to keep a custom overlay aligned with it — removed entirely. Google's own default place marker (real data, correctly positioned) is the only marker now. A styled marker would need the paid/API-key Maps JavaScript API — out of scope.
- Grayscale via CSS `filter` on the iframe (`sepia(0.15) grayscale(1) contrast(1.05) brightness(1.02)`) since URL params can't recolor a keyless embed.
- **Known caveat, not fixed proactively:** Google Maps iframes can sometimes capture wheel/scroll for zoom once clicked into; automated testing showed scroll passing through fine, but cross-origin iframe internals limit how fully that can be verified. `ContactContent.jsx`'s own pre-existing map embed has the same unprotected pattern with no reported issues.

### FinalCTA removed from About page
Client wanted the dark "Let's build something together." CTA gone from above Footer. `FinalCTA.jsx` had no usage outside `about/page.js` (grepped) — deleted the file entirely, not left as dead code. Confirmed `0px` gap between IndiaMap and Footer at 375/1440px (Footer's own ink background starts at its top edge), no other section had a ScrollTrigger/refresh dependency on FinalCTA's DOM presence.

### WhatWeBelieve — third rebuild: staircase reference layout (client-approved, precise spec)
History: sticky-stacked cards → split-screen scroll-progress track (rejected) → looser zigzag timeline (rejected) → **current: a staircase of 4 pill cards**, modeled on a client-provided reference and adapted to this project's brand (no colored icon chips/date chips from the reference — no project-timeline data to fill those with).
- **Card anatomy:** `rounded-[30px]` pill card (`#FBF6EE` surface), a maroon `TabCapsule` half-plugged into the left edge (step number "01"–"04" rotated -90°, cream on maroon), an `IconChip` (light ink-tint circle) with a hand-drawn inline SVG icon per belief (leaf, ruler, hourglass, two overlapping circles), title (Agatho) + body (Manrope, muted ink).
- **Desktop:** absolute-positioned in one `1100px`-tall container at staggered `{left%, top%}` offsets — card 1 upper-left, 2 right-and-down, 3 back left and further down, 4 lowest-right. Dashed curved SVG connectors link consecutive pairs. A real bug was caught via screenshot (not just code review): connector boxes sized off the raw staircase gap percentages put the curve *inside* the cards' own text, since a card's real height eats into the next card's nominal offset — fixed by remeasuring actual rendered card boundaries.
- **Mobile:** a fully separate set of card/connector elements (own refs, `hidden`/`md:hidden` CSS toggle, no JS breakpoint hook) collapses to a centered column with straight vertical connectors.
- **Reveal:** per-element one-shot `ScrollTrigger`s (`power3.out`, `toggleActions: "play none none none"`) — not a shared scroll-progress value (that was the rejected rebuild), not an animated connector line-draw (kept deliberately low-risk given this section's history of animation bugs). Confirmed via real scroll: cards accumulate and stay visible, never replace each other.
- Carries the `useReducedMotion(true)` fix (see below) — confirmed via Playwright all 8 card elements (4 desktop + 4 mobile, both always in the DOM) read `opacity: 1` immediately under reduced motion.

**Generic bug worth remembering for any future `usePreloaderGate`-gated component:** if a component defaults `useReducedMotion()` to `false` on first render, the gated GSAP effect can briefly run with that stale value before the hook resolves, `gsap.set()` something to `opacity: 0`, and when `reduceMotion` then flips `true`, `gsap.context`'s `revert()` restores its own pre-recorded snapshot — which was *also* `0` — instead of clearing the override, leaving the element permanently invisible under reduced motion. Fix: pass `useReducedMotion(true)` (assume reduced until `matchMedia` resolves), same pattern `Quote.jsx` already used for a related reason. Found and fixed in `WhatWeBelieve.jsx`; proactively applied in `LocationsMap`/`IndiaMapEmbed` usage too.

### New global chrome: ScrollProgress bar
`src/components/ScrollProgress.jsx` — thin (`h-[3px]`) fixed maroon bar, top of viewport, fills as the user scrolls the whole page. Client's reference used framer-motion; rebuilt natively in GSAP (this project's locked stack has no framer-motion). Mounted once in `layout.js` alongside `Preloader`/`SmoothScroll`.
- **Real bug found via testing:** `trigger: document.documentElement` never filled the bar at all — `getBoundingClientRect()` on the root element reports viewport height, not document height. Fixed with GSAP's `start: 0, end: "max"` whole-page idiom instead (no trigger element).
- **z-[110], not the spec's z-50** — Nav's header is `z-[100]` and covers the same top strip; at z-50 the bar would be hidden behind Nav whenever it's solid (most of an actual scroll session).
- **Route-change refresh needed and added:** this component lives in the persistent root layout (doesn't remount on navigation), so its one-time setup effect's `ScrollTrigger` end position goes stale after a client-side nav to a page with a different height. Nothing else in the codebase refreshes `ScrollTrigger` on route change (`SmoothScroll.jsx`'s own refresh only runs on ITS initial mount) — added `useEffect(() => ScrollTrigger.refresh(), [pathname])`. Confirmed via a real `<Link>` click between `/` and `/projects` (different heights) that the bar recomputes correctly.
- Not gated by `useReducedMotion` (linear indicator, not a motion effect) — still gated by `usePreloaderGate`.

### Preloader logo size fix
Logo was rendering too small — wrapper div had a stale `w-[clamp(220px,30vw,400px)]` sized for the old logo file. Bumped to `w-[clamp(300px,45vw,900px)]`; also corrected the `<Image>` intrinsic hint to the real ratio (1600×716, ≈2.236:1). CSS `w-full h-auto` governs actual render — the wrapper class was the real constraint, not the hint.

### Nav responsiveness pass
Found and fixed a real bug: the desktop nav (links + Inquire button) switched on at `md` (768px) but didn't fit there — links wrapped, the Inquire button clipped off-screen (confirmed via screenshot). Moved the mobile/desktop cutover from `md` to `lg` (1024px, confirmed clean) across all four spots that need to agree. Also fixed mobile-menu link tap targets (36px → 44px via `py-1` + reduced `gap-7`→`gap-5`, same total rhythm). Corrected the logo's intrinsic height hint for CLS accuracy (not a visible bug — modern browsers use the real decoded bitmap ratio for `width:auto` sizing once loaded). Mobile menu behavior and the transparent/solid filter swap re-verified at all 5 breakpoints, including `lightHero` pages.

### Footer responsiveness pass
Audited at 375/768/1024/1440/1920px — grid layout, signup form, nav/social columns, wordmark reveal, legal row all already responsive, no overflow at any width. Only fix: `LOGO_ASPECT_RATIO` constant was stale (`1104/268`, briefly `8000/4500` in an uncommitted edit) against the logo's real `6154/2752` ratio — `object-contain` already prevented visible distortion, so not a live bug, but corrected while already in the file.

### Full-site responsiveness pass — remaining 5 sections all confirmed already responsive, no fixes needed
Tested at ~375/768/1024/1440/1920px via Playwright (real navigation + real scroll, never `fullPage: true` screenshots — see §4 for why that method produces false positives on this codebase):
- **Home page** (Hero, Quote, About, Projects, Instagram, Press): zero horizontal overflow at any breakpoint across the full scroll depth; Hero/Instagram/Press visually spot-checked clean at mobile and desktop; Quote/About/Projects already have established `isDesktop`-matchMedia-gated simple/enhanced fallbacks per `brain.md`.
- **About page** (AboutHero, MeetFounders, WhatWeBelieve, IndiaMap, Footer handoff): zero overflow at any breakpoint. One apparent bug (a large gap + cut-off "Founders" wordmark at 768px) turned out to be a mid-pin-transition frame caught by an intermediate scroll position, not a static bug — confirmed by checking the settled state after scrolling fully past the wordmark's ~128vh pin, which renders cleanly.
- **Contact page** (ContactContent, ContactLocationMap, the form): zero overflow at any breakpoint, clean screenshots at mobile.
- **Projects listing** (ProjectsHero, ProjectsGrid): zero overflow at any breakpoint, clean screenshot at mobile.
- **Project detail page** (ProjectHero, ProjectGallery, ProjectVideo, NextProjectLink): zero overflow through the full scroll depth (verified on `the-modern-organic-home`, which has `hasVideo: true`) at both mobile and desktop.

### Logo swap (context for the above — completed in an earlier pass this session)
New logo file live at `public/logos/logo.png`, 6154×2752px, transparent PNG (multi-color wordmark: maroon "SP", olive "ACE", black type). All three logo-bearing files (Preloader, Nav, Footer) confirmed on the new file with correct color-filter handling for light/dark contexts.

---

## 3. Known pending / not yet done

- **A WhatWeBelieve rebuild using React Bits' "ScrollStack" pattern (image+text cards, shared Lenis instance, real project photography) was requested but never started** — superseded mid-investigation by this session's reconciliation-and-responsiveness pass. If picked back up: `SmoothScroll.jsx`'s Lenis instance is **not currently exposed** anywhere outside that component (no module singleton, no context) — a new one would need to be created without instantiating a second `Lenis()` (two competing instances would fight over the same window scroll). Also note `getAllProjects()`/`getProjectBySlug()` in `src/lib/projects.js` use Node's `fs` module directly — **server-only**, cannot be called inside a `"use client"` component; any real-photo selection needs to happen in a Server Component (e.g. `about/page.js`) and get passed down as props, the same pattern `src/app/projects/[slug]/page.js` already uses.
- **Lenis smooth-scroll config** (`src/components/SmoothScroll.jsx`): `duration: 1.1`, cubic ease-out, `smoothWheel: true`, `wheelMultiplier: 1`, `touchMultiplier: 1.5`. No in-code comment marks these as provisional. Untouched.
- **Projects/Instagram/Press/Footer (homepage) motion-polish** — confirmed not touched by the same retiming pass Hero/Quote/About got (this is a *timing/easing* gap, separate from this session's *responsiveness* pass — don't conflate the two). `Projects.jsx` has some unrelated prior timing work (a ~15% settle buffer before its pin releases).
- **Footer logo treatment** — code-wise resolved (fully on the new logo). What may still need a client look is just whether the cream-recolored wipe-in *reads well*, not a code decision.
- **Contact form backend** — still UI-only, `handleSubmit` just calls `e.preventDefault()`.
- **Real phone/email** — still placeholder ("Coming soon — reach us on Instagram for now").
- **Press section real content** — still 4 placeholder entries.
- **About page copy** — AboutHero's studio description, both founder bios, and WhatWeBelieve's 4 belief bodies are all still placeholder text (titles are real).
- **ClientsGrid.jsx / ScrollFloat.jsx** — confirmed still don't exist anywhere in the repo, despite duplicate "Add Projects and ClientsGrid sections" commits in history. Still an open question for the team.
- **"Shraddha's Thinkpad"** — confirmed still fully live (`src/data/projects.js`, 27 photos, no video).
- **Orphaned about-page image files** (`S.png`, `P.png`, `S-cutout.png`, `P-cutout.png`, `philosophy-1.jpg`, `philosophy-2.jpg`) — zero references anywhere in `src/`, safe-to-delete candidates from a scrapped multi-photo AboutHero concept, left untouched.

---

## 4. Historical dead-end, condensed (context only — not an open bug)

Three separate investigation passes (in an earlier session) chased a report that WhatWeBelieve's heading "renders nothing" / "never becomes visible," using a hand-rolled character-split scroll reveal (ScrollFloat pattern) that existed at the time. Every method tried — DOM queries, computed styles, forward/backward scroll, a production build, cold browser contexts — reproduced the heading rendering correctly, every time. No code defect was ever found. The heading implementation from that era **no longer exists** — WhatWeBelieve has since been fully rebuilt three times (see §2), and the current heading is plain, unanimated markup with no character-split, no ScrollTrigger, nothing left for that class of bug to hide in. This section is kept only as a flag: if a similar "section X renders nothing" report ever recurs on this codebase, check first whether the diagnostic method was a `fullPage: true` Playwright screenshot (confirmed separately, twice, to freeze every scroll-triggered reveal on the page mid-animation without firing real scroll events, producing a false "broken" appearance) before assuming a real regression.

---

## 5. brain.md sync status

`brain.md`'s site-map table has been patched directly (not just noted here) to reflect `/about`'s current route (`StudioDescription` and `FinalCTA` both removed). Still not yet patched in `brain.md` itself: its media-infrastructure section says local `public/images/projects/<slug>/` folders "still exist locally on disk with real photos" — that's no longer true, every one is empty except one git-tracked video file.

---

**Reminder:** this file reflects a snapshot taken 2026-09-05. Re-verify anything load-bearing against the live repo (`git status`, `git log`, and a direct read of the relevant file) before acting on it in a new session — don't chain decisions off this document alone.

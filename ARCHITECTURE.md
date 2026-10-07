# Studio SP_ACE website: architecture

Marketing and portfolio site for Studio SP_ACE, an interior design studio in Bangalore. It's built with Next.js 16 (App Router) in plain JavaScript, with Tailwind CSS v4, GSAP + ScrollTrigger, and Lenis smooth scroll. Project media is hosted on Cloudinary. Sanity (at `/studio`) lets the client add new projects and press mentions without a developer.

Read this file first, then `AGENTS.md`. **This Next.js version has breaking changes**, so check `node_modules/next/dist/docs/` before writing framework code.

---

## 1. Quick start

```bash
npm install
cp .env.example .env.local      # fill in the values (see section 8)
npm run dev                     # http://localhost:3000
npm run build && npm start      # production build, the one to test against
npm run lint                    # should report 0 problems
```

Node 22.12 or newer is required (`engines` in `package.json`).

---

## 2. Folder structure

```
src/
  app/                  Routes (App Router). Each page.js assembles sections.
    layout.js           Root layout: fonts, site-wide metadata, SiteChrome wrapper
    page.js             /            Home
    about/page.js       /about
    projects/page.js    /projects    Listing
    projects/[slug]/    /projects/<slug>  Detail (statically generated per project)
    contact/page.js     /contact
    media/page.js       /media       Press
    terms/, privacy/    Legal pages
    studio/[[...tool]]/ /studio      Sanity Studio (CMS)
    api/contact/route.js  POST endpoint for the enquiry form (sends email)
    robots.js, sitemap.js, not-found.js, icon.png, apple-icon.png, favicon.ico
  components/
    home/               Home page sections, plus Nav and Footer (used on every page)
    about/              About page sections
    projects/           Listing grid, detail hero, gallery, video, cards
    contact/            Contact page and the shared enquiry form
    media/              Press page
    legal/              Terms/Privacy layout
    ui/                 Button, InlineWordmark
    SiteChrome.jsx      Preloader + Lenis smooth scroll + scroll progress bar
    SmoothScroll.jsx    The single Lenis instance (see section 6)
    Preloader.jsx       Logo intro, once per tab session
  data/
    projects.js         The 7 original projects: copy + display order
    press.js            Press mentions
  lib/
    projects.js         Builds project data from data/ + manifest + Cloudinary + Sanity
    press.js            Merges data/press.js with Sanity press mentions
    site.js             SITE_URL, share-image helpers
    cloudinaryImage.js  Responsive srcset for Cloudinary images in plain <img>
    mailer.js, rateLimit.js  Contact form email + in-memory rate limit
    lenis.js            Access to the shared Lenis instance
  hooks/                useReducedMotion, usePreloaderGate
  sanity/               Sanity client, env defaults, schemas (project, pressMention)
  fonts/                Agatho (headings): .woff2 subset is served, .otf is the source
scripts/
  photo-manifest.json       Photo list/order/dimensions per project (hand-edited)
  cloudinary-url-map.json   Local path -> Cloudinary URL for every uploaded file
  convert-to-webp.js        Compress new photos before upload
  upload-to-cloudinary.js   Upload a project folder and update the URL map
public/
  images/, videos/, logos/  Home/About images, hero video, logo. Project photos are
                            NOT here; they live on Cloudinary.
```

---

## 3. Pages and what they contain

| Route | Sections (in order) |
|---|---|
| `/` | Nav, HeroQuoteTransition (hero video, pinned), Quote (pinned word reveal), About (pinned image/text split on desktop), Projects (3 featured cards), Instagram, Press carousel, Footer |
| `/projects` | Nav, ProjectsHero (full-screen image shrinks into the "Our Projects" heading), ProjectsGrid (all projects), Footer |
| `/projects/<slug>` | Nav, ProjectHero (cover shrinks, stats panel appears, "Read More" modal), ProjectGallery, ProjectVideo (if the project has one), NextProjectLink, Footer |
| `/about` | Nav, AboutHero, MeetFounders, WhatWeBelieve (pinned card stack), IndiaMap, Footer |
| `/contact` | Nav, ContactContent (hero, enquiry form, studio info, "Let's Connect" / "Join Our Team"), Footer without its form |
| `/media` | Nav, MediaHero, MediaGrid (press cards), Footer |
| `/terms`, `/privacy` | Nav, LegalContent, Footer. **Copy is placeholder pending lawyer review.** |
| `/studio` | Sanity Studio. The preloader, Lenis and progress bar are skipped here (SiteChrome) |

The Footer on every page (except `/contact`) contains the same enquiry form as the Contact page (`ContactForm.jsx`). Both post to `/api/contact`.

Server components (`page.js` files) resolve anything that needs the filesystem (`getProjectPhoto()`, manifest reads) and pass plain URLs down to `"use client"` components.

---

## 4. Project data flow

Three sources are combined by `src/lib/projects.js`:

1. **`src/data/projects.js`**: copy for the 7 original projects (name, descriptions, typology, location, size, year). **Array order is the display order** for the `/projects` grid **and** the "Next Project" chain at the bottom of each detail page (each project links to the next one, and the last wraps to the first). Nothing re-sorts it, so to reorder projects you reorder this array.
2. **`scripts/photo-manifest.json`**: for each project slug, `photos` (filename + pixel width/height, in gallery order), `hasVideo`, `posterFile`, and optional flags. This is the only record of what's in each gallery: the local photo files were deleted after the move to Cloudinary.
3. **`scripts/cloudinary-url-map.json`**: maps each `public/images/projects/<slug>/<file>` path to its Cloudinary URL. `toCloudinaryUrl()` does the lookup.

Projects added in Sanity (`/studio`) are appended after the static ones and keep their own photos in Sanity. If Sanity is unreachable, the site still builds with the static projects. **Sanity content is read at build time** (pages are statically generated with no `revalidate`), so a project or press mention the client adds appears on the live site only after the next build/deploy.

### Cover and gallery rules (per project in the manifest)

- **Default:** the **first** photo in `photos` is the cover (listing card, detail hero, Next Project preview, share image) and is **left out** of the gallery. The gallery is photos 2..n in order.
- **`"coverFile": "<filename>"`:** that photo is the cover, and the **whole** `photos` list is the gallery, cover included at its listed position. Used by Modern Eclectic, Modern Neo Classical and Shraddha's Thinkpad, where the client gave a full gallery order but kept a different cover.
- **`"wide": true`** on a photo: shown in a two-column landscape cell instead of the standard portrait cell (e.g. Modern Organic's `PAS_0754.webp`). If only one column is left in a row it starts the next row, leaving that slot empty.

The gallery (`ProjectGallery.jsx`) is a uniform grid: every cell is 2:3 portrait at the same row height, filled strictly left to right in manifest order. Photos are cropped with `object-fit: cover`, and clicking one opens the full uncropped photo. Columns: 2 on phones, 3 from ~600px of grid width, 4 from 1024px, up to 6 on very wide screens.

### Changing gallery order or covers

Edit `scripts/photo-manifest.json` by hand (reorder the objects in `photos`, add or remove `coverFile` / `wide`), then rebuild. The manifest is maintained by hand only: there is no script that regenerates it (the local photo files it was first built from no longer exist).

### Adding photos to an existing project

1. Put the originals in `public/images/projects/<slug>/`.
2. `node scripts/convert-to-webp.js <slug>` converts them to WebP and moves the originals to `media-source/` (gitignored).
3. `npm run upload:cloudinary -- <slug>` uploads them and updates `cloudinary-url-map.json`. It needs the `CLOUDINARY_*` keys, and Cloudinary's free plan rejects files over 10MB.
4. Add the new files (with width/height) to that project's `photos` in `photo-manifest.json`.
5. Delete the local WebP copies (they are not deployed).

For a brand-new project, the client can add it in `/studio` without any of these steps.

The Home page's three featured cards (`components/home/Projects.jsx`) use their own curated images (`public/images/projects/project-1/2/3.jpg`). Each name must stay paired with its image; the pairs are noted in the file.

---

## 5. Images, video and fonts

- **Cloudinary images:** use `CldImage` (next-cloudinary) where the size is known from CSS. Where the box is sized by JS (gallery, belief cards), a plain `<img>` gets `responsiveImageProps()` from `lib/cloudinaryImage.js`, which offers resized, auto-format variants. Never serve the full-size originals directly: they are ~2400px.
- **Local images** (`public/`) go through `next/image`.
- **Hero video:** `public/videos/hero-video-hevc.mp4` / `-h264.mp4` with a poster image.
- **Project videos:** Cloudinary-hosted. They autoplay muted and loop, the `src` is attached only when the section is near, and they have play/pause and mute buttons. Under reduced motion there's no autoplay.
- **Fonts:** Manrope (body, `next/font/google`) and Agatho (headings, `next/font/local`). Only a subset of Agatho is served: the full font's punctuation and accented glyphs are "buy font" watermarks. Regeneration instructions are in `layout.js`. Both fonts use `font-display: swap` (the next/font default).
- **Social share image:** `DEFAULT_SHARE_IMAGE` in `lib/site.js` (a project photo cropped to 1200x630 by Cloudinary). Project pages use their own cover. Swap in a dedicated image when the client provides one.

---

## 6. Scroll and animation conventions (important)

- **One Lenis instance.** `SmoothScroll.jsx` creates it in the root layout, and it persists across page navigations. Never call `new Lenis()` anywhere else; read it with `getLenis()` from `lib/lenis.js`. SmoothScroll also:
  - calls `ScrollTrigger.update` on every Lenis scroll;
  - recomputes the scroll limit when `<body>` resizes (a new page's content can finish loading after navigation);
  - calls `lenis.reset()` on every route change, so a link clicked mid-scroll (e.g. "Next Project") opens the new page at the top instead of letting the old glide continue.
- **Pinning = `position: sticky` + a scrubbed timeline, never ScrollTrigger's `pin: true`.** `pin: true` inserts DOM outside React's tree and crashes on unmount.
- **"Golden rule":** an element that is transformed by one scroll animation must not also be the trigger of another. Quote renders as a sibling of the hero (not inside it) for this reason.
- **`usePreloaderGate(setup, deps, enabled)`:** every ScrollTrigger is created only after the preloader finishes, because positions must be measured against the settled layout. `setup` returns its cleanup, usually `() => ctx.revert()`.
- **`useReducedMotion()`:** every animated section has a static fallback. Some sections start as "reduced" (`useReducedMotion(true)`) to avoid a first-paint flash.
- **Easing:** `ease: "none"` for scrubbed timelines, `power3.out` for one-shot reveals.
- **Coupled values:** some sections depend on each other's heights, and the comments at each spot name the partner. Examples: Quote's 65svh mobile frame and About's mobile pull-up; ProjectsHero's settled heading height and ProjectsGrid's `mt-[calc(...)]`. Change them together.
- **Test pinned sections by scrolling forward AND back.** Most historical bugs appeared only when scrolling in reverse.

Brand tokens: cream `#F7EFE4`, ink `#2B2622`, maroon `#6E1F24`. The spacing scale is Tailwind's defaults.

---

## 7. Contact form and email

`ContactForm.jsx` (Contact page and Footer) validates on the client and POSTs JSON to `src/app/api/contact/route.js`. The route:

- rate-limits per IP (`lib/rateLimit.js`, in memory: fine for one Node process, but it would need a shared store across several);
- re-validates every field (required fields, length caps, email format);
- sends via Nodemailer using the `SMTP_*` env vars (`lib/mailer.js`), with `replyTo` set to the visitor's address.

If SMTP isn't configured, the visitor sees a friendly error and the server log names what's missing. If sending fails, the full enquiry is written to the server log so it can be followed up by hand.

---

## 8. Deployment and environment variables

`npm run build` then `npm start` (`next start`, port 3000 by default or `PORT`). This is a standard Node server with nothing Vercel-specific: no Edge runtime, no Vercel Analytics, and `next/image` optimisation runs inside `next start` using `sharp`.

**Hostinger (Node.js hosting):** set these in hPanel's environment variables **before building**, because `NEXT_PUBLIC_*` values are baked in at build time.

| Variable | Needed | Purpose |
|---|---|---|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Yes (build time) | Cloudinary images |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Yes | Contact form email (Gmail: use an App Password) |
| `CONTACT_TO_EMAIL` | Yes | Where enquiries are delivered |
| `CONTACT_FROM_EMAIL` | Optional | "From" address (defaults to `SMTP_USER`) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION` | Optional | Defaults are in `src/sanity/env.js` |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | No: local only | Upload script. Keep the secret off the server |

`.env.local` is gitignored; only `.env.example` (no real values) is committed.

The production domain `https://studiospace.co.in` is set once, as `SITE_URL` in `src/lib/site.js`. It's used for `metadataBase`, `robots.txt` and `sitemap.xml`.

Security headers and the Content-Security-Policy live in `next.config.mjs`. If you add a new external origin (a script, image host, iframe or API), add it there, or the browser will block it. `/studio` has its own looser policy.

**Sanity Studio** needs the site's production URL added to the Sanity project's CORS origins (sanity.io/manage) for `/studio` to work on the live domain.

---

## 9. Known gaps before or after launch

- Terms and Privacy copy is placeholder pending lawyer review (`LegalContent.jsx`).
- Some copy is placeholder, marked `TODO` in code: the Contact hero heading/subtext, the Media hero subtext, the Press heading, the MeetFounders tagline and the Projects hero photo.
- New Sanity content needs a rebuild to appear (section 4). To make it appear on its own, add `export const revalidate = <seconds>` to the affected pages, or trigger a redeploy from a Sanity webhook.
- No dedicated social share image yet (see section 5).
- `npm audit` flags Sanity CLI tooling (not used by the live pages). See `TODO.md`.

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";

const CREAM = "#F7EFE4";
// Lightbox scrim/close-button use ink (#2B2622) directly as rgba() literals
// below (for opacity), not this named constant -- no solid-ink usage in
// this file otherwise.

// Fallback aspect ratio (height / width) for the rare photo missing manifest
// dimensions -- matches the old GalleryImage's "4 / 5" CSS aspect-ratio
// fallback exactly, just expressed as a height multiplier instead of a CSS
// aspect-ratio string, since masonry needs a real pixel height up front.
const FALLBACK_HEIGHT_RATIO = 5 / 4;

// Column-count breakpoints, keyed off the actual measured container width
// (via ResizeObserver on the grid itself). The gallery now renders edge-to-
// edge of the viewport (see the section markup below), not this site's
// usual max-w-[1100px] content column, so containerWidth is effectively the
// real viewport width -- these tiers are tuned against that full range
// (~327px on a 375px phone up through ultra-wide desktops), not the old
// ~1100px-capped inner widths. More tiers than before for exactly that
// reason: a fixed "4 columns and done" cap that was fine capped at 1100px
// reads as absurdly wide individual photos once the container can be
// 1920px+, so column count keeps climbing (capped at 6) rather than a
// handful of images stretching edge to edge.
const COLUMN_BREAKPOINTS = [
  { minWidth: 2200, columns: 6 },
  { minWidth: 1900, columns: 5 },
  { minWidth: 1024, columns: 4 },
  { minWidth: 640, columns: 3 },
  { minWidth: 0, columns: 2 },
];
const GAP_WIDE = 24;
const GAP_NARROW = 12;
const GAP_BREAKPOINT = 640;

function getColumnCount(containerWidth) {
  const tier = COLUMN_BREAKPOINTS.find((b) => containerWidth >= b.minWidth);
  return tier.columns;
}

// Packs `photos` into `columns` using the standard masonry heuristic --
// each photo goes into whichever column is currently shortest, using its
// real width/height (from scripts/photo-manifest.json, see @/lib/projects)
// to compute a proportional height at that column's width so portraits and
// landscapes actually read as taller/wider relative to each other, not a
// random or fixed box.
function computeMasonryLayout(photos, containerWidth) {
  const columns = getColumnCount(containerWidth);
  const gap = containerWidth >= GAP_BREAKPOINT ? GAP_WIDE : GAP_NARROW;
  const columnWidth = columns > 0 ? (containerWidth - (columns - 1) * gap) / columns : 0;
  const colHeights = new Array(columns).fill(0);

  const items = photos.map((photo) => {
    const col = colHeights.indexOf(Math.min(...colHeights));
    const ratio = photo.width && photo.height ? photo.height / photo.width : FALLBACK_HEIGHT_RATIO;
    const height = columnWidth * ratio;
    const x = col * (columnWidth + gap);
    const y = colHeights[col];

    colHeights[col] += height + gap;

    return { x, y, width: columnWidth, height };
  });

  const totalHeight = colHeights.length > 0 ? Math.max(...colHeights) - gap : 0;

  return { items, totalHeight: Math.max(totalHeight, 0) };
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1 1L15 15M15 1L1 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Full-screen lightbox for a clicked photo -- portaled to document.body for
// the same reason ProjectDescriptionModal.jsx is: masonry items above sit
// under a live GSAP `transform` (the position/size tween), which turns them
// into a containing block for any descendant `position: fixed` node, so a
// non-portaled overlay would be clipped/mispositioned by whichever item was
// clicked instead of covering the real viewport.
function GalleryLightbox({ photo, alt, onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6 py-12"
      style={{ backgroundColor: "rgba(43,38,34,0.85)" }}
      onClick={onClose}
      role="presentation"
    >
      <div className="relative max-h-full max-w-full" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -right-2 -top-2 flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-200 ease-out hover:bg-white/10"
          style={{ color: CREAM, backgroundColor: "rgba(43,38,34,0.6)" }}
        >
          <CloseIcon />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element -- see the
            file-level comment on GalleryItem for why this is a plain <img>. */}
        <img
          src={photo.src}
          alt={alt}
          className="max-h-[85vh] max-w-[90vw] rounded-[8px] object-contain"
        />
      </div>
    </div>,
    document.body
  );
}

// Individual masonry item -- position/size are driven entirely by GSAP
// (see the layout effect below), never by this element's own CSS, so it's
// just an absolutely-positioned box with a real <img> filling it. Plain
// <img>, not CldImage/next/image -- same reasoning WhatWeBelieve's stack
// cards already established on this site: the box's pixel width/height are
// already resolved by JS-driven masonry math, and next/image's <Image fill>
// additionally requires res.cloudinary.com in next.config.js's
// remotePatterns (a config change out of scope here), which CldImage needs
// too. A plain <img loading="lazy"> has neither requirement.
function GalleryItem({ photo, alt, itemRef, onOpen, onMouseEnter, onMouseLeave }) {
  return (
    <div
      ref={itemRef}
      className="absolute left-0 top-0 cursor-pointer overflow-hidden rounded-[8px]"
      style={{ willChange: "transform, width, height, opacity, filter" }}
      onClick={onOpen}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
    </div>
  );
}

// Masonry grid (adapted from React Bits' "Masonry" pattern) replacing the
// old row-grouped layout (landscape-full-width / portrait-clustered rows,
// see @/lib/projects's now-removed groupGalleryRows). Real project photos,
// full color throughout -- no grayscale/filter anywhere in this component
// (unlike the site's Google Maps embeds, which are intentionally
// black-and-white; that's a different, unrelated convention).
export default function ProjectGallery({ name, photos = [] }) {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const hasMountedRef = useRef(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const reduceMotion = useReducedMotion();

  // Plain, always-on measurement (not preloader-gated) -- same pattern
  // MeetFounders' wordmark sizing uses: this just tracks real layout, the
  // GSAP positioning effect below is what actually needs to wait for the
  // preloader.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const measure = () => setContainerWidth(el.getBoundingClientRect().width);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layout = useMemo(
    () => computeMasonryLayout(photos, containerWidth),
    [photos, containerWidth]
  );

  // Gated through usePreloaderGate like every other animated component on
  // this site, even though this is a mount trigger rather than a scroll
  // trigger -- the container's width (used for the column-count math above)
  // only reflects real, settled layout once the preloader intro has
  // finished, same reasoning every ScrollTrigger-driven component here
  // already depends on this gate for.
  //
  // Always runs (not skipped under reduceMotion) because the masonry
  // position/size math itself isn't a motion effect -- photos still need to
  // land in their real grid position either way. reduceMotion only decides
  // whether that placement is tweened or set immediately, and whether the
  // hover-scale handlers below do anything.
  usePreloaderGate(
    () => {
      if (containerWidth <= 0 || layout.items.length === 0) return undefined;

      const ctx = gsap.context(() => {
        const isFirstMount = !hasMountedRef.current;

        layout.items.forEach((item, i) => {
          const el = itemRefs.current[i];
          if (!el) return;

          if (isFirstMount && !reduceMotion) {
            // Mount-in: blur-to-focus + slide up into place, staggered so
            // photos read as settling in one after another rather than a
            // single simultaneous block.
            gsap.fromTo(
              el,
              {
                opacity: 0,
                x: item.x,
                y: item.y + 40,
                width: item.width,
                height: item.height,
                filter: "blur(8px)",
              },
              {
                opacity: 1,
                x: item.x,
                y: item.y,
                width: item.width,
                height: item.height,
                filter: "blur(0px)",
                duration: 0.7,
                ease: "power3.out",
                delay: i * 0.05,
              }
            );
          } else if (isFirstMount) {
            // reduceMotion, first mount: final position/full opacity
            // immediately, no blur/slide, no stagger delay.
            gsap.set(el, {
              opacity: 1,
              x: item.x,
              y: item.y,
              width: item.width,
              height: item.height,
            });
          } else {
            // Not the first mount -- a resize/breakpoint change reflowed
            // the grid. Reposition existing items rather than replaying the
            // mount-in animation; still respects reduceMotion (immediate
            // set instead of a tween).
            const vars = { x: item.x, y: item.y, width: item.width, height: item.height };
            if (reduceMotion) {
              gsap.set(el, vars);
            } else {
              gsap.to(el, { ...vars, duration: 0.5, ease: "power3.out", overwrite: "auto" });
            }
          }
        });
      }, containerRef);

      hasMountedRef.current = true;

      return () => ctx.revert();
    },
    [containerWidth, layout, reduceMotion],
    photos.length > 0
  );

  const handleMouseEnter = (i) => {
    if (reduceMotion) return;
    const el = itemRefs.current[i];
    if (el) gsap.to(el, { scale: 0.97, duration: 0.3, ease: "power2.out" });
  };

  const handleMouseLeave = (i) => {
    if (reduceMotion) return;
    const el = itemRefs.current[i];
    if (el) gsap.to(el, { scale: 1, duration: 0.3, ease: "power2.out" });
  };

  if (photos.length === 0) return null;

  return (
    <section className="w-full px-6 py-16 md:px-0 md:py-24" style={{ backgroundColor: CREAM }}>
      {/* Full-width relative to the viewport, not this page's usual
          max-w-[1100px] content column -- same override IndiaMap.jsx uses
          for its own full-bleed map (no horizontal padding on the section,
          no max-w/mx-auto on this grid itself), so photos actually run edge
          to edge instead of sitting in a narrower centered block with dead
          cream space on either side. Mobile only keeps the site's 24px
          gutter (px-6) -- at phone width, photos flush against the screen
          edges read as a layout bug next to the gutter-aligned text around
          them. The ResizeObserver below measures this div's own width, so
          the columns reflow to fit inside that padding. */}
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ height: layout.totalHeight }}
      >
        {photos.map((photo, i) => (
          <GalleryItem
            key={photo.file ?? photo.src}
            photo={photo}
            alt={`${name} — photo ${i + 1}`}
            itemRef={(el) => {
              itemRefs.current[i] = el;
            }}
            onOpen={() => setLightboxIndex(i)}
            onMouseEnter={() => handleMouseEnter(i)}
            onMouseLeave={() => handleMouseLeave(i)}
          />
        ))}
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox
          photo={photos[lightboxIndex]}
          alt={`${name} — photo ${lightboxIndex + 1}`}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  );
}

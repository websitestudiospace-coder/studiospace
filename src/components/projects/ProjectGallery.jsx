"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";
import { responsiveImageProps } from "@/lib/cloudinaryImage";

const CREAM = "#F7EFE4";
// Lightbox scrim/close button use ink (#2B2622) as rgba() literals.

// Every cell is the same 2:3 portrait box so rows line up regardless of each
// photo's orientation; photos are cropped with object-fit: cover (the lightbox
// shows them uncropped). 2:3 is the native shape of nearly every photo.
const CELL_HEIGHT_RATIO = 3 / 2;

// Column tiers keyed off the measured grid width (full viewport minus the side
// gutter). The 3-column tier and wide gap start at 600 so a 768px tablet gets
// 3 columns after the gutter and scrollbar.
const COLUMN_BREAKPOINTS = [
  { minWidth: 2200, columns: 6 },
  { minWidth: 1900, columns: 5 },
  { minWidth: 1024, columns: 4 },
  { minWidth: 600, columns: 3 },
  { minWidth: 0, columns: 2 },
];
const GAP_WIDE = 24;
const GAP_NARROW = 12;
const GAP_BREAKPOINT = 600;

function getColumnCount(containerWidth) {
  const tier = COLUMN_BREAKPOINTS.find((b) => containerWidth >= b.minWidth);
  return tier.columns;
}

// Uniform grid filled strictly left to right, top to bottom, in manifest
// order (the client's chosen sequence). Every row has the same height. A
// photo flagged `wide` in the manifest spans two columns at the same row
// height; if fewer than two columns are left in the row it starts the next
// row, leaving that slot empty (the order can't be shuffled to fill it).
function computeGridLayout(photos, containerWidth) {
  const columns = getColumnCount(containerWidth);
  const gap = containerWidth >= GAP_BREAKPOINT ? GAP_WIDE : GAP_NARROW;
  const cellWidth = columns > 0 ? (containerWidth - (columns - 1) * gap) / columns : 0;
  const cellHeight = cellWidth * CELL_HEIGHT_RATIO;

  let row = 0;
  let col = 0;
  const items = photos.map((photo) => {
    const span = photo.wide ? Math.min(2, columns) : 1;
    if (col + span > columns) {
      row += 1;
      col = 0;
    }
    const item = {
      x: col * (cellWidth + gap),
      y: row * (cellHeight + gap),
      width: span * cellWidth + (span - 1) * gap,
      height: cellHeight,
    };
    col += span;
    if (col >= columns) {
      row += 1;
      col = 0;
    }
    return item;
  });

  const rows = col === 0 ? row : row + 1;
  const totalHeight = rows > 0 ? rows * (cellHeight + gap) - gap : 0;

  return { items, totalHeight: Math.max(totalHeight, 0) };
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1 1L15 15M15 1L1 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Full-screen lightbox, portaled to <body>: grid items are GSAP-transformed,
// which would make them the containing block for a `position: fixed` overlay.
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
        {/* eslint-disable-next-line @next/next/no-img-element -- full-size original on purpose */}
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

// Position/size are driven entirely by GSAP (see the layout effect below),
// so this is just an absolutely-positioned box with an <img> filling it.
// Plain <img> rather than next/image: the box is sized by JS, and
// responsiveImageProps supplies Cloudinary-resized variants.
//
// `placed` gates the <img>: until the layout effect has run, every item is
// an unsized box at the grid's top-left corner, all inside the browser's
// lazy-load distance at once, so every photo would download at page load
// despite loading="lazy".
function GalleryItem({ photo, alt, placed, cellWidth, itemRef, onOpen, onMouseEnter, onMouseLeave }) {
  return (
    <div
      ref={itemRef}
      className="absolute left-0 top-0 cursor-pointer overflow-hidden rounded-[8px]"
      style={{ willChange: "transform, width, height, opacity, filter" }}
      onClick={onOpen}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {placed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          {...responsiveImageProps(photo.src, `${Math.ceil(cellWidth)}px`)}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

// Project photo grid (entrance animation adapted from React Bits' "Masonry").
export default function ProjectGallery({ name, photos = [] }) {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const hasMountedRef = useRef(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [placed, setPlaced] = useState(false);
  const reduceMotion = useReducedMotion();

  // Always-on width measurement; only the GSAP positioning waits for the
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
    () => computeGridLayout(photos, containerWidth),
    [photos, containerWidth]
  );

  // Waits for the preloader so the measured width reflects settled layout.
  // Always runs, even with reduced motion: items still need positioning;
  // reduceMotion only decides tween vs. immediate set (and hover scaling).
  usePreloaderGate(
    () => {
      if (containerWidth <= 0 || layout.items.length === 0) return undefined;

      const ctx = gsap.context(() => {
        const isFirstMount = !hasMountedRef.current;

        layout.items.forEach((item, i) => {
          const el = itemRefs.current[i];
          if (!el) return;

          if (isFirstMount && !reduceMotion) {
            // Mount-in: staggered blur-to-focus and slide up.
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
            // Later runs (resize/breakpoint change): move items into place
            // without replaying the entrance.
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
      setPlaced(true);

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
    <section className="w-full px-6 py-16 md:px-8 md:py-24" style={{ backgroundColor: CREAM }}>
      {/* Wider than the usual max-w-[1100px] column, inset by a side gutter
          (px-6 / md:px-8) so the outer columns never touch the viewport
          edge. The ResizeObserver measures this div, so columns fit inside
          that padding. */}
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
            placed={placed}
            cellWidth={layout.items[i]?.width ?? 0}
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

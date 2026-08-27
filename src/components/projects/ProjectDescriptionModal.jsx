"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

const CREAM = "#F7EFE4";
const INK = "#2B2622";

// Rendered via a portal straight onto document.body -- this modal can be
// opened while the hero's pinned scroll sequence is mid-tween, and several
// of that sequence's elements carry a live GSAP `transform`/`filter`, either
// of which turns its element into a containing block for any descendant
// `position: fixed` node. Portaling out to the body sidesteps that
// entirely, so the overlay always covers the real viewport regardless of
// what the hero is doing underneath it.
export default function ProjectDescriptionModal({ name, longDescription, onClose }) {
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
      style={{ backgroundColor: "rgba(43,38,34,0.7)" }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-[640px] rounded-[8px] px-6 py-10 md:px-12 md:py-14"
        style={{ backgroundColor: CREAM }}
        role="dialog"
        aria-modal="true"
        aria-label={`${name} — full description`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 ease-out hover:bg-black/5"
          style={{ color: INK }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M1 1L15 15M15 1L1 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <h2
          className="pr-10 uppercase"
          style={{ fontFamily: "var(--font-agatho)", color: INK, fontSize: "clamp(24px, 3vw, 32px)" }}
        >
          {name}
        </h2>

        {/* TODO: label + longDescription below are placeholder copy pending
            the client's real project write-up. */}
        <p
          className="mt-2 text-xs uppercase tracking-[0.15em]"
          style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.65 }}
        >
          About the project
        </p>

        <div
          className="mt-6 whitespace-pre-line text-sm leading-relaxed md:text-base"
          style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.75 }}
        >
          {longDescription}
        </div>
      </div>
    </div>,
    document.body
  );
}

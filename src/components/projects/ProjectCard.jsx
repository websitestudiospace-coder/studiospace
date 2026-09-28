"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CldImage } from "next-cloudinary";
import useReducedMotion from "@/hooks/useReducedMotion";

const CREAM = "#F7EFE4";
const INK = "#2B2622";

// Real hover capability, not just viewport width -- a touch device with a
// wide screen (a tablet in landscape, say) still can't hover, so this
// checks `(hover: hover)` directly rather than a breakpoint. Starts `false`
// (assume no hover, i.e. the always-visible fallback) until the check
// resolves on mount -- errs toward showing the overlay first rather than
// risking a flash of hidden text on a touch device.
function useCanHover() {
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return canHover;
}

// The project card shared by the /projects listing (ProjectsGrid) and the
// homepage's "Our Projects" section (home/Projects), so a change here
// applies to both. Entrance animations stay with each caller (they differ),
// which is why the ref and any initial inline style are passed in.
//
// `image` is either a Cloudinary/remote URL (the listing's covers) or a
// local /public path (the homepage's curated photos, not mirrored to
// Cloudinary) -- CldImage for the former, next/image for the latter.
export default function ProjectCard({
  href,
  name,
  location,
  image,
  priority = false,
  cardRef,
  style,
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const canHover = useCanHover();
  const reduceMotion = useReducedMotion();

  // Touch devices get the overlay permanently visible (there's no `:hover`
  // to reveal it on), but at a slightly lower opacity than the desktop
  // hover-in state -- a full-strength dark scrim sitting on every card at
  // once reads heavier scrolling a mobile grid (several cards visible in
  // the viewport simultaneously) than the same scrim appearing transiently
  // under a cursor on desktop, so this dials it back a touch rather than
  // matching the hover state 1:1. `reduceMotion` only removes the
  // transition itself on hover-capable devices -- the reveal-on-hover/
  // focus logic still works, it just snaps instead of easing.
  const overlayVisibilityClass = !canHover
    ? "opacity-90"
    : reduceMotion
      ? "opacity-0 group-hover:opacity-100 group-focus:opacity-100"
      : "opacity-0 translate-y-3 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-focus:opacity-100 group-focus:translate-y-0";

  const imageProps = {
    alt: name,
    fill: true,
    sizes: "(max-width: 768px) 100vw, 33vw",
    className: "object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03]",
    onError: () => setImageFailed(true),
  };

  return (
    <Link
      href={href}
      ref={cardRef}
      className="group relative block aspect-[4/5] w-full overflow-hidden rounded-[8px]"
      style={style}
    >
      {imageFailed || !image ? (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${INK} 0%, rgba(43,38,34,0.6) 100%)`,
          }}
        />
      ) : image.startsWith("/") ? (
        <Image src={image} priority={priority} {...imageProps} />
      ) : (
        <CldImage src={image} priority={priority} {...imageProps} />
      )}
      {/* Clean by default -- no visible scrim/text until hover (or
          focus/touch, see overlayVisibilityClass above). Height is
          content-driven (name + location + padding), not a fixed fraction
          of the card, so it reads as a bottom "strip" rather than covering
          half the photo. Ink-toned scrim (not black) per the brand-token
          rule -- rgba(43,38,34,...) is #2B2622 -- fading from solid-ish at
          the bottom edge to fully transparent above, with a real
          backdrop-filter blur over that same region for the frosted-glass
          look from the client's reference. Text centered (both axes) per
          that same reference -- no "view project" icon anymore (client
          asked for it removed); padding is symmetric top/bottom now that
          there's no icon to reserve extra headroom for. */}
      <div
        className={`absolute inset-x-0 bottom-0 flex flex-col items-center justify-center px-5 py-5 text-center md:px-6 md:py-6 ${overlayVisibilityClass}`}
        style={{
          background:
            "linear-gradient(to top, rgba(43,38,34,0.85) 0%, rgba(43,38,34,0.55) 55%, rgba(43,38,34,0) 100%)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-manrope)",
            color: CREAM,
            fontSize: "clamp(13px, 1.2vw, 17px)",
            fontWeight: 700,
          }}
        >
          {name}
        </p>
        {location ? (
          <p
            className="mt-1"
            style={{
              fontFamily: "var(--font-manrope)",
              color: CREAM,
              opacity: 0.75,
              fontSize: "clamp(12px, 1vw, 13px)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {location}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

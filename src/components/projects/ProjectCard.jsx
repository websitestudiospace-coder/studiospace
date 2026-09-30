"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CldImage } from "next-cloudinary";
import useReducedMotion from "@/hooks/useReducedMotion";

const CREAM = "#F7EFE4";
const INK = "#2B2622";

// Real hover capability (not width): tablets can be wide and still can't
// hover. Starts false so touch devices never flash a hidden overlay.
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

// Project card shared by the /projects listing and the home page's featured
// section. Entrance animations stay with each caller, which passes the ref
// and any initial style. `image` is a Cloudinary URL (CldImage) or a local
// /public path (next/image).
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

  // Touch devices can't hover, so the overlay is always visible there, at a
  // lower opacity so a grid of cards doesn't look heavy. Reduced motion only
  // removes the transition.
  const overlayVisibilityClass = !canHover
    ? "opacity-90"
    : reduceMotion
      ? "opacity-0 group-hover:opacity-100 group-focus:opacity-100"
      : "opacity-0 translate-y-3 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-focus:opacity-100 group-focus:translate-y-0";

  const imageProps = {
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
        <Image src={image} alt={name} priority={priority} {...imageProps} />
      ) : (
        <CldImage src={image} alt={name} priority={priority} {...imageProps} />
      )}
      {/* Name/location strip at the bottom: hidden until hover/focus (always
          shown on touch). Ink-tinted scrim with a backdrop blur. */}
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

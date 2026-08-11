"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const INK = "#2B2622";

const HANDLE = "studio_sp_ace";
const INSTAGRAM_URL = "https://instagram.com/studio_sp_ace";

// isVideo / isCarousel are per-post flags for the reel play-icon and
// carousel-corner overlays -- none of the current 8 posts are reels or
// carousels, but the grid still supports both for whenever they are.
const POSTS = [
  { image: "/images/instagram/post-1.jpg", isVideo: false, isCarousel: false },
  { image: "/images/instagram/post-2.jpg", isVideo: false, isCarousel: false },
  { image: "/images/instagram/post-3.jpg", isVideo: false, isCarousel: false },
  { image: "/images/instagram/post-4.jpg", isVideo: false, isCarousel: false },
  { image: "/images/instagram/post-5.jpg", isVideo: false, isCarousel: false },
  { image: "/images/instagram/post-6.jpg", isVideo: false, isCarousel: false },
  { image: "/images/instagram/post-7.jpg", isVideo: false, isCarousel: false },
  { image: "/images/instagram/post-8.jpg", isVideo: false, isCarousel: false },
];

function CarouselIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="absolute top-2 right-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
    >
      <rect x="1" y="4" width="9" height="9" rx="2" stroke={CREAM} strokeWidth="1.3" />
      <rect x="5" y="1" width="9" height="9" rx="2" fill={INK} stroke={CREAM} strokeWidth="1.3" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
    >
      <path d="M8 4.5V23.5L23 14L8 4.5Z" fill={CREAM} />
    </svg>
  );
}

// The bundled Agatho font's underscore glyph is a "buy font" watermark, not
// a real underscore (see Footer.jsx's InlineWordmark) -- draw it as a small
// decorative bar instead of relying on the font's own glyph.
function InlineHandle({ text }) {
  return text.split("").map((char, i) =>
    char === "_" ? (
      <span
        key={i}
        aria-hidden="true"
        style={{
          display: "inline-block",
          position: "relative",
          top: "0.14em",
          width: "0.32em",
          height: "0.09em",
          backgroundColor: "currentColor",
        }}
      />
    ) : (
      char
    )
  );
}

function InstagramGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke={CREAM} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="5" stroke={CREAM} strokeWidth="1.8" />
      <circle cx="17.6" cy="6.4" r="1.2" fill={CREAM} />
    </svg>
  );
}

export default function Instagram() {
  const sectionRef = useRef(null);
  const profileRef = useRef(null);
  const gridRefs = useRef([]);
  const followRef = useRef(null);
  const gridWrapRef = useRef(null);
  const colorLayerRefs = useRef([]);
  const radiusRef = useRef(260);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const motionMql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(motionMql.matches);
    update();
    motionMql.addEventListener("change", update);
    return () => motionMql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const hoverMql = window.matchMedia("(hover: hover)");
    const update = () => setCanHover(hoverMql.matches);
    update();
    hoverMql.addEventListener("change", update);
    return () => hoverMql.removeEventListener("change", update);
  }, []);

  // Grayscale spotlight -- purely a hover layer above the grid, kept out of
  // React state per pointermove so it never triggers a re-render. Each card
  // is grayscale by default; a full-color duplicate is clipped to a growing
  // circle (clip-path, not mask-image -- mask-image silently fails to paint
  // past the first of several simultaneous instances on this renderer) that
  // reveals it under the cursor. Each card's --x/--y are the cursor position
  // in that card's own local space, so the circle still reads as one
  // continuous spotlight sweeping across grid boundaries. Radius is measured
  // from the actual card width so it stays proportional whether the grid is
  // 2- or 4-columns.
  useEffect(() => {
    if (!canHover) return;
    const wrap = gridWrapRef.current;
    const layers = colorLayerRefs.current.filter(Boolean);
    if (!wrap || layers.length === 0) return;

    const computeRadius = () => {
      const card = gridRefs.current[0];
      if (!card) return;
      const w = card.getBoundingClientRect().width;
      radiusRef.current = Math.min(300, Math.max(220, w * 1.05));
    };
    computeRadius();
    window.addEventListener("resize", computeRadius);

    const setters = layers.map((layer) => ({
      setX: gsap.quickSetter(layer, "--x", "px"),
      setY: gsap.quickSetter(layer, "--y", "px"),
    }));

    let offsets = [];
    const computeOffsets = () => {
      const wrapRect = wrap.getBoundingClientRect();
      offsets = layers.map((layer) => {
        const r = layer.getBoundingClientRect();
        return { x: r.left - wrapRect.left, y: r.top - wrapRect.top };
      });
    };

    const handleMove = (e) => {
      const wrapRect = wrap.getBoundingClientRect();
      const gx = e.clientX - wrapRect.left;
      const gy = e.clientY - wrapRect.top;
      setters.forEach(({ setX, setY }, i) => {
        const off = offsets[i];
        if (!off) return;
        setX(gx - off.x);
        setY(gy - off.y);
      });
    };

    const handleEnter = (e) => {
      computeOffsets();
      handleMove(e);
      gsap.to(layers, {
        "--r": `${radiusRef.current}px`,
        duration: 0.3,
        ease: "power2.out",
        overwrite: true,
      });
    };

    const handleLeave = () => {
      gsap.to(layers, {
        "--r": "0px",
        duration: 0.5,
        ease: "power2.out",
        overwrite: true,
      });
    };

    wrap.addEventListener("pointermove", handleMove);
    wrap.addEventListener("pointerenter", handleEnter);
    wrap.addEventListener("pointerleave", handleLeave);

    return () => {
      window.removeEventListener("resize", computeRadius);
      wrap.removeEventListener("pointermove", handleMove);
      wrap.removeEventListener("pointerenter", handleEnter);
      wrap.removeEventListener("pointerleave", handleLeave);
      gsap.killTweensOf(layers);
    };
  }, [canHover]);

  useEffect(() => {
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      const items = gridRefs.current.filter(Boolean);

      // ONE consolidated timeline on the section's own scroll range: profile
      // row first, then the 8 grid items stagger left-to-right/top-to-bottom,
      // then the Follow button -- mirrors the single-timeline rule used by
      // Projects/Footer instead of giving each piece its own ScrollTrigger.
      gsap.set(profileRef.current, { opacity: 0, y: 24 });
      gsap.set(items, { opacity: 0, y: 24 });
      gsap.set(followRef.current, { opacity: 0, y: 24 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom 65%",
          scrub: 0.5,
        },
      });

      tl.to(profileRef.current, { opacity: 1, y: 0, duration: 0.4, ease: "none" }, 0);

      items.forEach((item, i) => {
        tl.to(
          item,
          { opacity: 1, y: 0, duration: 0.3, ease: "none" },
          0.3 + i * 0.07
        );
      });

      tl.to(
        followRef.current,
        { opacity: 1, y: 0, duration: 0.4, ease: "none" },
        0.3 + items.length * 0.07 + 0.15
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className="w-full px-6 py-12 md:px-16 md:py-[100px]"
      style={{ backgroundColor: CREAM }}
    >
      <div className="mx-auto w-full max-w-[1100px]">
        <div ref={profileRef} className="flex items-center gap-4">
          <div
            className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full md:h-16 md:w-16"
            style={{ backgroundColor: INK }}
          >
            {!avatarFailed && (
              <Image
                src="/images/instagram/avatar.jpg"
                alt={`@${HANDLE}`}
                fill
                sizes="64px"
                className="object-cover"
                onError={() => setAvatarFailed(true)}
              />
            )}
          </div>
          <span
            className="text-base md:text-lg"
            style={{ fontFamily: "var(--font-manrope)", color: INK }}
          >
            @<InlineHandle text={HANDLE} />
          </span>
        </div>

        <div
          ref={gridWrapRef}
          className="relative mt-8 grid grid-cols-2 gap-2 md:mt-10 md:grid-cols-4 md:gap-4"
        >
          {POSTS.map((post, i) => (
            <a
              key={post.image}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              ref={(el) => {
                gridRefs.current[i] = el;
              }}
              className="group relative block aspect-square w-full overflow-hidden rounded-[6px]"
            >
              <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.04]">
                <Image
                  src={post.image}
                  alt={`${HANDLE} Instagram post ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                  style={canHover ? { filter: "grayscale(1) brightness(0.78)" } : undefined}
                />
                {canHover && (
                  <div
                    ref={(el) => {
                      colorLayerRefs.current[i] = el;
                    }}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                      "--x": "0px",
                      "--y": "0px",
                      "--r": "0px",
                      clipPath: "circle(var(--r) at var(--x) var(--y))",
                      WebkitClipPath: "circle(var(--r) at var(--x) var(--y))",
                    }}
                  >
                    <Image
                      src={post.image}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
              {post.isCarousel && <CarouselIcon />}
              {post.isVideo && <PlayIcon />}
            </a>
          ))}
        </div>

        <div className="mt-10 flex justify-center md:mt-14">
          <a
            ref={followRef}
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs uppercase tracking-[0.15em] transition-opacity duration-300 hover:opacity-80"
            style={{ backgroundColor: INK, color: CREAM, fontFamily: "var(--font-manrope)" }}
          >
            <InstagramGlyph />
            Follow on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}

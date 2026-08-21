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

function ProfileRow({ profileRef, avatarFailed, setAvatarFailed }) {
  return (
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
  );
}

function PostGrid({ gridWrapRef, gridRefs, colorLayerRefs, canHover }) {
  return (
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
            if (gridRefs) gridRefs.current[i] = el;
          }}
          className="group relative block aspect-square w-full overflow-hidden rounded-[6px]"
        >
          <div className="absolute inset-0 transition-transform duration-200 ease-out group-hover:scale-[1.04]">
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
                  if (colorLayerRefs) colorLayerRefs.current[i] = el;
                }}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  "--x": "-9999px",
                  "--y": "-9999px",
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
  );
}

function FollowButton({ followRef, transitionReady }) {
  return (
    <div className="mt-10 flex justify-center md:mt-14">
      <a
        ref={followRef}
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-xs uppercase leading-[1.4] tracking-[0.15em] hover:opacity-80 ${
          transitionReady ? "transition-opacity duration-200 ease-out" : ""
        }`}
        style={{ backgroundColor: INK, color: CREAM, fontFamily: "var(--font-manrope)" }}
      >
        <InstagramGlyph />
        Follow on Instagram
      </a>
    </div>
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
  const [entranceDone, setEntranceDone] = useState(false);

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
    // No entrance timeline plays in the reduced-motion fallback (items are
    // rendered already-settled), so there's nothing for the spotlight to
    // wait on there.
    if (!canHover || !(entranceDone || reduceMotion)) return;
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
        duration: 0.2,
        ease: "power2.out",
        overwrite: true,
      });
    };

    const handleLeave = () => {
      gsap.to(layers, {
        "--r": "0px",
        duration: 0.2,
        ease: "power2.out",
        overwrite: true,
        onComplete: () => {
          // Belt-and-suspenders: with --r back at 0 the circle is already
          // invisible regardless of --x/--y, but snap the position fully
          // off-canvas too so there's no leftover coordinate sitting on the
          // element between hovers.
          setters.forEach(({ setX, setY }) => {
            setX(-9999);
            setY(-9999);
          });
        },
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
  }, [canHover, entranceDone, reduceMotion]);

  // No GSAP entrance runs under reduced motion, so nothing else will ever
  // flip this -- flip it immediately so the Follow button still gets its
  // hover transition (see FollowButton's transitionReady prop).
  useEffect(() => {
    if (reduceMotion) setEntranceDone(true);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;

    // One-shot reveal (not scroll-scrubbed): this section doesn't need to
    // feel scroll-locked, so it just plays once as it enters the viewport.
    // Still waits for "preloader:complete" since "top 80%" is calculated
    // against this section's own position, which depends on every section
    // above it already being in its final, settled layout.
    let ctx;

    const setup = () => {
      const items = gridRefs.current.filter(Boolean);

      ctx = gsap.context(() => {
        gsap.set(profileRef.current, { opacity: 0, y: 24, willChange: "opacity, transform" });
        gsap.set(items, { opacity: 0, y: 24, willChange: "opacity, transform" });
        gsap.set(followRef.current, { opacity: 0, y: 24, willChange: "opacity, transform" });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
          onComplete: () => {
            gsap.set([profileRef.current, ...items, followRef.current], {
              opacity: 1,
              y: 0,
              willChange: "auto",
            });
            // Spotlight hover is gated behind this: the grid should only
            // show its plain fade+translateY entrance (no interaction
            // layered on top) until every post has actually finished
            // entering.
            setEntranceDone(true);
          },
        });

        tl.to(profileRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0);
        tl.to(
          items,
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.06 },
          0.1
        );
        tl.to(
          followRef.current,
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
          0.1 + items.length * 0.06
        );
      }, sectionRef);
    };

    if (window.__preloaderDone) {
      setup();
    } else {
      window.addEventListener("preloader:complete", setup, { once: true });
    }

    return () => {
      ctx?.revert();
      window.removeEventListener("preloader:complete", setup);
    };
  }, [reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className="w-full px-6 py-12 md:px-16 md:py-[100px]"
      style={{ backgroundColor: CREAM }}
    >
      <div className="mx-auto w-full max-w-[1100px]">
        <ProfileRow
          profileRef={profileRef}
          avatarFailed={avatarFailed}
          setAvatarFailed={setAvatarFailed}
        />
        <PostGrid
          gridWrapRef={gridWrapRef}
          gridRefs={gridRefs}
          colorLayerRefs={colorLayerRefs}
          canHover={canHover}
        />
        <FollowButton followRef={followRef} transitionReady={entranceDone} />
      </div>
    </section>
  );
}

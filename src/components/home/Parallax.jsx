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
const MAROON = "#6E1F24";
const SAGE = "#5C6B47";

// TODO: placeholder copy -- swap for real client-provided heading/eyebrow
// once available.
const EYEBROW = "The Studio Approach";
const HEADING = "Spaces That Move With You";

// Layers 1/2/4 are moving image bands; layer 3 (the center heading) is
// static -- see the ScrollTrigger below.
const LAYERS = [
  { key: "layer-1", image: "/images/parallax/layer-1.jpg", fallback: SAGE, speed: 70 },
  { key: "layer-2", image: "/images/parallax/layer-2.jpg", fallback: MAROON, speed: 55 },
  { key: "layer-4", image: "/images/parallax/layer-4.jpg", fallback: INK, speed: 10 },
];

function HeadingLayer({ headingFailed, onImageError }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-6">
      <div className="relative w-full max-w-[900px] overflow-hidden rounded-[8px]">
        {headingFailed ? (
          <div className="absolute inset-0" style={{ backgroundColor: INK }} />
        ) : (
          <Image
            src="/images/parallax/layer-3.jpg"
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 900px"
            className="object-cover"
            onError={onImageError}
          />
        )}
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative flex flex-col items-center gap-3 px-8 py-20 text-center md:py-28">
          <p
            className="uppercase tracking-[0.2em] text-xs md:text-sm"
            style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.85 }}
          >
            {EYEBROW}
          </p>
          <h2
            style={{
              fontFamily: "var(--font-agatho)",
              fontSize: "clamp(28px, 4.5vw, 48px)",
              lineHeight: 1.15,
              color: CREAM,
            }}
          >
            {HEADING}
          </h2>
        </div>
      </div>
    </div>
  );
}

export default function Parallax() {
  const sectionRef = useRef(null);
  const layerRefs = useRef([]);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [failedImages, setFailedImages] = useState(() => new Set());
  const [headingFailed, setHeadingFailed] = useState(false);

  const markFailed = (key) =>
    setFailedImages((prev) => new Set(prev).add(key));

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const layers = layerRefs.current.filter(Boolean);

    // Each layer here is both the trigger reference (via the shared
    // section-level ScrollTrigger below) and the transform target of its
    // own tween, and none of these layers contain any descendant with its
    // own separate ScrollTrigger -- so there's no ancestor/descendant
    // caching mismatch to guard against here (contrast Projects.jsx, where
    // that constraint forced a different structure).
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "0% 0%",
          end: "100% 0%",
          scrub: 0,
        },
      });

      LAYERS.forEach((layer, i) => {
        const el = layers[i];
        if (!el) return;
        tl.fromTo(
          el,
          { yPercent: -layer.speed / 2 },
          { yPercent: layer.speed / 2, ease: "none" },
          0
        );
      });
      // Layer 3 (the center heading) is intentionally left untouched --
      // it holds still while the layers around it drift, which is what
      // reads as depth.
    }, sectionRef);

    return () => ctx.revert();
  }, [reduceMotion]);

  if (reduceMotion) {
    return (
      <section className="w-full" style={{ backgroundColor: CREAM }}>
        <div className="grid grid-cols-1 md:grid-cols-3">
          {LAYERS.map((layer) =>
            failedImages.has(layer.key) ? (
              <div
                key={layer.key}
                className="h-[45vh] w-full"
                style={{ backgroundColor: layer.fallback }}
              />
            ) : (
              <div key={layer.key} className="relative h-[45vh] w-full overflow-hidden">
                <Image
                  src={layer.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  onError={() => markFailed(layer.key)}
                />
              </div>
            )
          )}
        </div>
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <p
            className="uppercase tracking-[0.2em] text-xs md:text-sm"
            style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.6 }}
          >
            {EYEBROW}
          </p>
          <h2
            style={{
              fontFamily: "var(--font-agatho)",
              fontSize: "clamp(28px, 4.5vw, 48px)",
              lineHeight: 1.15,
              color: INK,
            }}
          >
            {HEADING}
          </h2>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden"
      style={{ backgroundColor: CREAM }}
    >
      <div className="absolute inset-0 flex">
        {LAYERS.map((layer, i) => (
          <div
            key={layer.key}
            ref={(el) => {
              if (el) layerRefs.current[i] = el;
            }}
            className="relative -top-[45%] h-[190%] w-1/3 overflow-hidden"
          >
            {failedImages.has(layer.key) ? (
              <div
                className="absolute inset-0"
                style={{ backgroundColor: layer.fallback }}
              />
            ) : (
              <Image
                src={layer.image}
                alt=""
                fill
                sizes="34vw"
                className="object-cover"
                onError={() => markFailed(layer.key)}
              />
            )}
          </div>
        ))}
      </div>

      <HeadingLayer
        headingFailed={headingFailed}
        onImageError={() => setHeadingFailed(true)}
      />
    </section>
  );
}

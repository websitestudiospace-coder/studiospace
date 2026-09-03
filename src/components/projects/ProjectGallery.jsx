"use client";

import { useEffect, useRef, useState } from "react";
import { CldImage } from "next-cloudinary";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";

function GalleryImage({ photo, alt, sizes, innerRef, reduceMotion }) {
  return (
    <div
      ref={innerRef}
      className="relative w-full overflow-hidden rounded-[8px]"
      style={{
        aspectRatio: photo.width && photo.height ? `${photo.width} / ${photo.height}` : "4 / 5",
        // Pre-hidden here (not just via gsap.set below) so there's no flash
        // of fully-visible content before the preloader-gated effect below
        // ever runs -- same reasoning the row-level version of this used to
        // rely on, just moved down to each individual image now that each
        // one animates independently.
        ...(reduceMotion ? null : { opacity: 0 }),
      }}
    >
      <CldImage src={photo.src} alt={alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}

// Mixed portrait/landscape layout: each row is either a single full-width
// landscape photo or 2-3 portraits side by side, following whatever
// @/lib/projects's groupGalleryRows already determined from the actual
// folder contents -- this component only renders the shape it's handed.
export default function ProjectGallery({ name, rows }) {
  const sectionRef = useRef(null);
  const rowRefs = useRef([]);
  // One array of image elements per row (imageRefs.current[rowIndex] is an
  // array, not a single element) -- populated via the per-image ref
  // callbacks below. Kept separate from rowRefs, which still exist purely
  // to give each row's ScrollTrigger something to measure "top 85%" against.
  const imageRefs = useRef([]);
  const reduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  const enhanced = !reduceMotion;

  // Same reasoning as ProjectHero/About/Projects: each row's ScrollTrigger
  // start ("top 85%") is measured against layout that only settles once
  // Preloader's intro finishes. Creating these triggers before then bakes
  // in stale positions, which is what left every row beyond the first
  // couple permanently stuck at opacity:0 -- their measured trigger
  // position never lined up with where they actually ended up on screen.
  // Still ONE ScrollTrigger per ROW (not per image) -- a 30-photo gallery is
  // maybe a dozen rows, so this keeps trigger count in check even though
  // each row now animates its own images individually rather than as one
  // block: the "photos hung one at a time" effect comes from an internal
  // stagger across each row's images, all driven off that single trigger,
  // not from giving every image its own trigger.
  usePreloaderGate(
    () => {
      const ctx = gsap.context(() => {
        const rowEls = rowRefs.current.filter(Boolean);

        rowEls.forEach((rowEl, i) => {
          const images = (imageRefs.current[i] || []).filter(Boolean);
          if (images.length === 0) return;

          gsap.set(images, { opacity: 0, y: 24, scale: 0.92 });

          gsap.to(images, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: "power3.out",
            // 0.15s between each -- deliberate enough to read as photos
            // being hung one at a time rather than a simultaneous block,
            // short enough that a 3-photo row settles in well under a
            // second so scrolling past it never feels like a wait.
            stagger: 0.15,
            scrollTrigger: {
              trigger: rowEl,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          });
        });
      }, sectionRef);

      return () => ctx.revert();
    },
    [],
    enhanced
  );

  if (rows.length === 0) return null;

  return (
    <section ref={sectionRef} className="w-full px-6 py-16 md:px-16 md:py-24" style={{ backgroundColor: CREAM }}>
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-3 md:gap-6">
        {rows.map((row, i) => (
          <div
            key={i}
            ref={(el) => {
              rowRefs.current[i] = el;
            }}
          >
            {row.type === "landscape" ? (
              <GalleryImage
                photo={row.photo}
                alt={`${name} — photo`}
                sizes="(max-width: 768px) 100vw, 1100px"
                reduceMotion={reduceMotion}
                innerRef={(el) => {
                  if (!imageRefs.current[i]) imageRefs.current[i] = [];
                  imageRefs.current[i][0] = el;
                }}
              />
            ) : (
              // Portrait rows group up to 3 photos side by side on desktop,
              // but that renders each image at ~1/3 of a 390px viewport
              // (~101px wide) on mobile -- cap at 2 columns there instead,
              // wrapping a 3-photo row onto a second line.
              <div
                className="grid gap-3 md:gap-6"
                style={{
                  gridTemplateColumns: `repeat(${isDesktop ? row.photos.length : Math.min(row.photos.length, 2)}, minmax(0, 1fr))`,
                }}
              >
                {row.photos.map((photo, j) => {
                  const mobileCols = Math.min(row.photos.length, 2);
                  return (
                    <GalleryImage
                      key={photo.src}
                      photo={photo}
                      alt={`${name} — photo`}
                      sizes={`(max-width: 768px) ${Math.round(100 / mobileCols)}vw, ${Math.round(1100 / row.photos.length)}px`}
                      reduceMotion={reduceMotion}
                      innerRef={(el) => {
                        if (!imageRefs.current[i]) imageRefs.current[i] = [];
                        imageRefs.current[i][j] = el;
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

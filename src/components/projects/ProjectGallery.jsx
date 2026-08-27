"use client";

import { useEffect, useRef, useState } from "react";
import { CldImage } from "next-cloudinary";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useReducedMotion from "@/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";

function GalleryImage({ photo, alt, sizes }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[8px]"
      style={{ aspectRatio: photo.width && photo.height ? `${photo.width} / ${photo.height}` : "4 / 5" }}
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
  const reduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      const rowEls = rowRefs.current.filter(Boolean);
      gsap.set(rowEls, { opacity: 0, y: 32 });

      rowEls.forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reduceMotion]);

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
            style={reduceMotion ? undefined : { opacity: 0 }}
          >
            {row.type === "landscape" ? (
              <GalleryImage
                photo={row.photo}
                alt={`${name} — photo`}
                sizes="(max-width: 768px) 100vw, 1100px"
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
                {row.photos.map((photo) => {
                  const mobileCols = Math.min(row.photos.length, 2);
                  return (
                    <GalleryImage
                      key={photo.src}
                      photo={photo}
                      alt={`${name} — photo`}
                      sizes={`(max-width: 768px) ${Math.round(100 / mobileCols)}vw, ${Math.round(1100 / row.photos.length)}px`}
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

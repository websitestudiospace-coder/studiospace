"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useReducedMotion from "@/hooks/useReducedMotion";
import usePreloaderGate from "@/hooks/usePreloaderGate";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const INK = "#2B2622";
// Video scrub maps linearly across the whole pinned range (progress 0-1 ==
// video start-to-end, no phase percentages to rescale), so it needs a bit
// more runway than a pure transform sequence to avoid feeling rushed --
// kept slightly more generous than the other trimmed pins.
const SECTION_HEIGHT_VH = 170;

// Scroll-scrubbed video: rendered only when a project actually has a
// video.mp4 (see @/lib/projects's getProjectVideo -- this component never
// runs for a video-less project, the parent simply doesn't mount it).
export default function ProjectVideo({ video }) {
  const outerRef = useRef(null);
  const videoRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Scroll-scrubbing needs a pinned desktop-scale viewport to feel
  // intentional rather than jittery on a short mobile screen, so it's
  // gated the same as every other pinned sequence's reduced-motion opt-out
  // plus this extra device check -- same fallback shape the brief points
  // at in Hero.jsx (autoplay/loop/muted, no scroll tie-in), just reached
  // via an explicit check here instead of Hero.jsx's simpler always-native
  // approach, since this section additionally needs to skip the pin.
  const scrubEnabled = !reduceMotion && isDesktop;

  usePreloaderGate(
    () => {
      const videoEl = videoRef.current;
      if (!videoEl) return;

      let ctx;
      let scrollTriggerInstance;

      const bindScrub = () => {
        videoEl.pause();
        ctx = gsap.context(() => {
          scrollTriggerInstance = ScrollTrigger.create({
            trigger: outerRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
              if (videoEl.duration) {
                videoEl.currentTime = self.progress * videoEl.duration;
              }
            },
          });
        }, outerRef);
      };

      if (videoEl.readyState >= 1) {
        bindScrub();
      } else {
        videoEl.addEventListener("loadedmetadata", bindScrub, { once: true });
      }

      return () => {
        scrollTriggerInstance?.kill();
        ctx?.revert();
      };
    },
    [],
    scrubEnabled
  );

  if (!scrubEnabled) {
    return (
      <section className="relative w-full">
        <video
          poster={video.poster ?? undefined}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="h-[60vh] w-full object-cover md:h-[80vh]"
        >
          <source src={video.src} type="video/mp4" />
        </video>
      </section>
    );
  }

  return (
    <section ref={outerRef} className="relative w-full" style={{ height: `${SECTION_HEIGHT_VH}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ backgroundColor: INK }}>
        <video
          ref={videoRef}
          poster={video.poster ?? undefined}
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
        >
          <source src={video.src} type="video/mp4" />
        </video>
      </div>
    </section>
  );
}

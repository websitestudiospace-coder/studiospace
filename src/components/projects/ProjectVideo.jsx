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
      let objectUrl;
      let cancelled = false;

      const bindScrub = () => {
        // A <video> that's never been played can fail to paint any frame
        // once currentTime is set programmatically -- it just shows black
        // even though currentTime is advancing correctly underneath. A
        // one-time play-then-immediately-pause forces the browser to paint
        // an initial frame before scroll-driven scrubbing begins. Muted +
        // playsInline is what lets this autoplay without a user gesture;
        // if a browser still blocks it, .catch() no-ops and scrubbing
        // proceeds anyway (currentTime updates keep working regardless).
        videoEl.play().then(() => videoEl.pause()).catch(() => {});
        ctx = gsap.context(() => {
          scrollTriggerInstance = ScrollTrigger.create({
            trigger: outerRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.3,
            onUpdate: (self) => {
              if (videoEl.duration) {
                videoEl.currentTime = self.progress * videoEl.duration;
              }
            },
          });
        }, outerRef);
      };

      // Scrubbing seeks all over the timeline near-instantly, but a <video>
      // streaming over HTTP only keeps a modest window buffered ahead of
      // wherever it currently is -- a far seek outside that window forces a
      // fresh network fetch that can't complete before the next seek
      // supersedes it, so the visible frame lags far behind currentTime
      // (confirmed via pixel sampling across all 6 project videos: the
      // painted frame changed only 2-3 times across a full scroll, frozen
      // the rest of the time despite currentTime advancing correctly).
      // Fetching the whole file into memory first and scrubbing that
      // in-memory copy means every seek is zero-latency, no network race.
      fetch(video.src)
        .then((res) => res.blob())
        .then((blob) => {
          if (cancelled) return;
          objectUrl = URL.createObjectURL(blob);
          videoEl.addEventListener("loadedmetadata", bindScrub, { once: true });
          videoEl.src = objectUrl;
          videoEl.load();
        })
        .catch(() => {
          // Network/CSP/CORS failure -- fall back to the streamed <source>
          // so the video still plays (just without guaranteed-smooth
          // scrub) instead of showing nothing.
          if (videoEl.readyState >= 1) {
            bindScrub();
          } else {
            videoEl.addEventListener("loadedmetadata", bindScrub, { once: true });
          }
        });

      return () => {
        cancelled = true;
        scrollTriggerInstance?.kill();
        ctx?.revert();
        if (objectUrl) URL.revokeObjectURL(objectUrl);
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

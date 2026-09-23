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
const CREAM = "#F7EFE4";
// Video scrub maps linearly across the whole pinned range (progress 0-1 ==
// video start-to-end), so the pin's extra scroll distance is sized from the
// video's real duration -- a fixed height crammed every video, long or
// short, into the same ~70vh and made longer ones feel fast-forwarded.
// DEFAULT_SECTION_HEIGHT_VH is only the pre-metadata placeholder.
const DEFAULT_SECTION_HEIGHT_VH = 170;
// Typical continuous wheel/trackpad scroll pace -- tweak if it still feels off.
const ASSUMED_SCROLL_VH_PER_SEC = 50;
// Floor keeps short videos from getting a too-short, jerky pin; ceiling
// stops a long video from forcing absurdly long scrolling.
const MIN_SCROLL_VH = 70;
const MAX_SCROLL_VH = 400;
// Shows the mute/unmute button. Only meaningful while the project videos
// actually carry an audio track -- set false if they're ever re-encoded
// silent (e.g. with ffmpeg's -an) again.
const SOUND_ENABLED = true;

function SpeakerIcon({ muted }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill={CREAM} />
      {muted ? (
        <path d="M16 9.5l5 5M21 9.5l-5 5" stroke={CREAM} strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <path
          d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"
          stroke={CREAM}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

// min-h/min-w 44px -- same touch-target floor used elsewhere on the site.
function SoundToggle({ muted, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={muted ? "Unmute video" : "Mute video"}
      className="absolute bottom-6 right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full transition-opacity duration-200 ease-out hover:opacity-80"
      style={{ backgroundColor: "rgba(43,38,34,0.55)" }}
    >
      <SpeakerIcon muted={muted} />
    </button>
  );
}

// Scroll-scrubbed video: rendered only when a project actually has a
// video.mp4 (see @/lib/projects's getProjectVideo -- this component never
// runs for a video-less project, the parent simply doesn't mount it).
export default function ProjectVideo({ video }) {
  const outerRef = useRef(null);
  const videoRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);
  const [sectionHeightVh, setSectionHeightVh] = useState(DEFAULT_SECTION_HEIGHT_VH);
  const [muted, setMuted] = useState(true);

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
      let rafId;
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

        const duration = Number.isFinite(videoEl.duration) ? videoEl.duration : 0;
        const targetScrollVh = duration * ASSUMED_SCROLL_VH_PER_SEC;
        const scrollVh = Math.min(MAX_SCROLL_VH, Math.max(MIN_SCROLL_VH, targetScrollVh));
        setSectionHeightVh(100 + scrollVh);

        // Double rAF: the new height has to be committed and laid out
        // before the pin's start/end are measured. The refresh afterwards
        // re-measures every other ScrollTrigger below this section too,
        // since they all just shifted by the height change.
        rafId = requestAnimationFrame(() => {
          rafId = requestAnimationFrame(() => {
            if (cancelled) return;
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
            ScrollTrigger.refresh();
          });
        });
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
        cancelAnimationFrame(rafId);
        scrollTriggerInstance?.kill();
        ctx?.revert();
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    },
    [],
    scrubEnabled
  );

  // Sets the DOM property directly as well as state so the change is
  // instant. Note the desktop scrub path never actually plays (it only
  // seeks a paused video), so unmuting there has no audible effect -- only
  // the autoplay/loop fallback below produces sound.
  const handleToggleSound = () => {
    const next = !muted;
    setMuted(next);
    const videoEl = videoRef.current;
    if (!videoEl) return;
    videoEl.muted = next;
    // Some browsers pause an autoplaying video the moment it's unmuted;
    // this click is a real user gesture, so resuming with sound is allowed.
    if (!next && !scrubEnabled) videoEl.play().catch(() => {});
  };

  if (!scrubEnabled) {
    return (
      <section className="relative w-full">
        <video
          ref={videoRef}
          poster={video.poster ?? undefined}
          autoPlay
          loop
          muted={muted}
          playsInline
          preload="none"
          className="h-[60vh] w-full object-cover md:h-[80vh]"
        >
          <source src={video.src} type="video/mp4" />
        </video>
        {SOUND_ENABLED && <SoundToggle muted={muted} onToggle={handleToggleSound} />}
      </section>
    );
  }

  return (
    <section ref={outerRef} className="relative w-full" style={{ height: `${sectionHeightVh}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ backgroundColor: INK }}>
        <video
          ref={videoRef}
          poster={video.poster ?? undefined}
          muted={muted}
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
        >
          <source src={video.src} type="video/mp4" />
        </video>
        {SOUND_ENABLED && <SoundToggle muted={muted} onToggle={handleToggleSound} />}
      </div>
    </section>
  );
}

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
// The duration normally comes from the file itself at build time;
// DEFAULT_SECTION_HEIGHT_VH is only used if that couldn't be read.
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
// How far ahead of the viewport the video starts downloading. The section
// sits below the whole gallery, so fetching at page load (43MB+ on desktop)
// competed with the hero and gallery images for bandwidth on a file most
// visitors hadn't reached yet. Two viewports ahead still gives the blob a
// head start before the pin arrives.
const LOAD_AHEAD_MARGIN = "200% 0px";

function sectionHeightForDuration(duration) {
  const targetScrollVh = duration * ASSUMED_SCROLL_VH_PER_SEC;
  return 100 + Math.min(MAX_SCROLL_VH, Math.max(MIN_SCROLL_VH, targetScrollVh));
}

// Shown over the poster while the full file downloads (scrubbing can't
// start until it has), so the section reads as loading rather than frozen.
// Only ever rendered on the desktop scrub path, which is already skipped
// under prefers-reduced-motion, so the spin needs no separate opt-out.
function LoadingIndicator() {
  return (
    <div
      role="status"
      className="pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2.5 rounded-full px-4 py-2"
      style={{ backgroundColor: "rgba(43,38,34,0.55)" }}
    >
      <span
        aria-hidden="true"
        className="h-3.5 w-3.5 animate-spin rounded-full border-2"
        style={{ borderColor: "rgba(247,239,228,0.3)", borderTopColor: CREAM }}
      />
      <span
        className="text-xs uppercase tracking-[0.15em]"
        style={{ fontFamily: "var(--font-manrope)", color: CREAM }}
      >
        Loading
      </span>
    </div>
  );
}

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
  // null until matchMedia has actually been read. The server render (and
  // hydration) can't know the viewport, and treating that as "mobile" used
  // to mount the autoplay fallback with a real src for a moment on desktop
  // -- a streamed download racing the scrub path's own blob fetch.
  const [isDesktop, setIsDesktop] = useState(null);
  const [nearViewport, setNearViewport] = useState(false);
  // Sized from the duration read off the file at build time (see
  // readMp4Duration in @/lib/projects), so the pin's scroll range is final
  // on first render; the default only applies if that lookup failed.
  const [sectionHeightVh, setSectionHeightVh] = useState(() =>
    video.duration ? sectionHeightForDuration(video.duration) : DEFAULT_SECTION_HEIGHT_VH
  );
  const sectionHeightRef = useRef(sectionHeightVh);
  const [scrubReady, setScrubReady] = useState(false);
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
  const scrubEnabled = !reduceMotion && isDesktop === true;

  // Both branches below put outerRef on their <section>, so this re-attaches
  // if the branch switches; once near, it stays near. Observing only starts
  // at the first scroll (or straight away if the page opened already
  // scrolled): at hydration the gallery above hasn't measured its width
  // yet and is 0px tall, which put this section right under the hero and
  // tripped the observer on load.
  useEffect(() => {
    const el = outerRef.current;
    if (!el || nearViewport) return undefined;
    let io;
    const observe = () => {
      window.removeEventListener("scroll", observe);
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) setNearViewport(true);
        },
        { rootMargin: LOAD_AHEAD_MARGIN }
      );
      io.observe(el);
    };
    if (window.scrollY > 0) observe();
    else window.addEventListener("scroll", observe, { passive: true });
    return () => {
      window.removeEventListener("scroll", observe);
      io?.disconnect();
    };
  }, [scrubEnabled, nearViewport]);

  // Fallback path (mobile / reduced motion): the <video> has no <source>,
  // so nothing downloads until the device check has resolved and the
  // section is close. Then it streams as a normal autoplay/loop video.
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || scrubEnabled || isDesktop === null || !nearViewport) return;
    videoEl.src = video.src;
    videoEl.play().catch(() => {});
  }, [scrubEnabled, isDesktop, nearViewport, video.src]);

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

        // Normally identical to the build-time height already rendered, so
        // nothing moves. Only if the build-time duration was missing does
        // the section resize here -- then the refresh below re-measures
        // every ScrollTrigger further down the page, which just shifted.
        const duration = Number.isFinite(videoEl.duration) ? videoEl.duration : 0;
        const heightVh = sectionHeightForDuration(duration);
        const heightChanged = heightVh !== sectionHeightRef.current;
        if (heightChanged) {
          sectionHeightRef.current = heightVh;
          setSectionHeightVh(heightVh);
        }

        // Double rAF: any height change has to be committed and laid out
        // before the pin's start/end are measured.
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
            if (heightChanged) ScrollTrigger.refresh();
            setScrubReady(true);
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
      //
      // This fetch is the ONLY download on this path: the <video> below has
      // no <source> and preload="none", and gets a src only once the blob is
      // ready (or the fetch fails). A <source> with preload="auto" used to
      // make the browser stream the same file in parallel -- two extra
      // copies racing this fetch for bandwidth, then thrown away.
      fetch(video.src)
        .then((res) => res.blob())
        .then((blob) => {
          if (cancelled) return;
          objectUrl = URL.createObjectURL(blob);
          videoEl.addEventListener("loadedmetadata", bindScrub, { once: true });
          // preload="none" only exists to stop a download before this
          // point. Left in place on the in-memory copy it made Chrome keep
          // its decode pipeline minimal, which measurably slowed scrub
          // seeks (more stalls); "auto" costs nothing now the data is local.
          videoEl.preload = "auto";
          videoEl.src = objectUrl;
          videoEl.load();
        })
        .catch(() => {
          // Network/CSP/CORS failure -- fall back to streaming the file
          // directly so the video still scrubs (just without guaranteed-
          // smooth seeks) instead of showing nothing.
          if (cancelled) return;
          videoEl.addEventListener("loadedmetadata", bindScrub, { once: true });
          videoEl.preload = "auto";
          videoEl.src = video.src;
          videoEl.load();
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
    scrubEnabled && nearViewport
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
      <section ref={outerRef} className="relative w-full">
        {/* No <source>: the src is set by the fallback effect above, so
            this element never downloads during the server render /
            pre-matchMedia pass that every device goes through first. */}
        <video
          ref={videoRef}
          poster={video.poster ?? undefined}
          loop
          muted={muted}
          playsInline
          preload="none"
          className="h-[60vh] w-full object-cover md:h-[80vh]"
        />
        {SOUND_ENABLED && <SoundToggle muted={muted} onToggle={handleToggleSound} />}
      </section>
    );
  }

  return (
    <section ref={outerRef} className="relative w-full" style={{ height: `${sectionHeightVh}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ backgroundColor: INK }}>
        {/* No <source> and preload="none" on purpose -- the fetch above is
            the only download, and sets src itself once the file is ready. */}
        <video
          ref={videoRef}
          poster={video.poster ?? undefined}
          muted={muted}
          playsInline
          preload="none"
          className="h-full w-full object-cover"
        />
        {!scrubReady && <LoadingIndicator />}
        {SOUND_ENABLED && <SoundToggle muted={muted} onToggle={handleToggleSound} />}
      </div>
    </section>
  );
}

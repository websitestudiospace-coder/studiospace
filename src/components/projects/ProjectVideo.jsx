"use client";

import { useEffect, useRef, useState } from "react";
import useReducedMotion from "@/hooks/useReducedMotion";

const CREAM = "#F7EFE4";
const BUTTON_BG = "rgba(43,38,34,0.55)";
// Shows the mute/unmute button. Only meaningful while the project videos
// actually carry an audio track -- set false if they're ever re-encoded
// silent (e.g. with ffmpeg's -an) again.
const SOUND_ENABLED = true;
// How far ahead of the viewport the video gets its src. autoPlay overrides
// preload, so a <video autoPlay> with a src starts streaming at page load --
// and this section sits below the whole gallery, where that competed with
// the hero and gallery images for bandwidth on a video most visitors
// hadn't reached yet. Two viewports ahead leaves time to buffer the start.
const LOAD_AHEAD_MARGIN = "200% 0px";
// Every project video is 1920x1080 today. Used until the file's own
// metadata arrives, then replaced by its real ratio, so a differently
// shaped video is never cropped or stretched.
const DEFAULT_ASPECT_RATIO = "16 / 9";

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

function PlayPauseIcon({ paused, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {paused ? (
        <path d="M8 5.5v13l10.5-6.5z" fill={CREAM} />
      ) : (
        <path d="M7 5.5h3.5v13H7zM13.5 5.5H17v13h-3.5z" fill={CREAM} />
      )}
    </svg>
  );
}

// min-h/min-w 44px -- same touch-target floor used elsewhere on the site.
function IconButton({ label, onClick, children, className = "h-11 w-11" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex items-center justify-center rounded-full transition-opacity duration-200 ease-out hover:opacity-80 ${className}`}
      style={{ backgroundColor: BUTTON_BG }}
    >
      {children}
    </button>
  );
}

// Autoplaying, looping project video, rendered only when a project actually
// has a video.mp4 (see @/lib/projects's getProjectVideo -- the parent
// simply doesn't mount this otherwise). Plain progressive streaming: the
// files are encoded with +faststart, so playback starts once the first
// chunk arrives. Always starts muted -- browsers only allow autoplay
// without a user gesture when muted -- and the toggle turns sound on.
// A play/pause button sits beside it (WCAG 2.2.2: moving content longer
// than 5s needs a way to pause it). Under prefers-reduced-motion it doesn't
// autoplay at all: the poster shows with a centered play button instead.
export default function ProjectVideo({ video }) {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const playRequestedRef = useRef(false);
  // Starts `true` (assume reduced) until matchMedia is read -- the src only
  // lands after a scroll anyway, by which point this is the real value.
  const reduceMotion = useReducedMotion(true);
  const [nearViewport, setNearViewport] = useState(false);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(true);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(DEFAULT_ASPECT_RATIO);

  // Observing only starts at the first scroll (or straight away if the page
  // opened already scrolled): at hydration the gallery above hasn't
  // measured its width yet and is 0px tall, which put this section right
  // under the hero and tripped the observer on load.
  useEffect(() => {
    const el = sectionRef.current;
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
  }, [nearViewport]);

  const handleLoadedMetadata = (event) => {
    const { videoWidth, videoHeight } = event.currentTarget;
    if (videoWidth && videoHeight) setAspectRatio(`${videoWidth} / ${videoHeight}`);
  };

  // Sets the DOM property directly as well as state so the change is
  // instant. Unmuting never starts a paused video -- pausing is the play
  // button's job, and a reduced-motion visitor who only wants sound
  // shouldn't have it start moving.
  const handleToggleSound = () => {
    const next = !muted;
    setMuted(next);
    const videoEl = videoRef.current;
    if (videoEl) videoEl.muted = next;
  };

  // A click is a user gesture, so play() is allowed even where muted
  // autoplay was refused (e.g. iOS Low Power Mode leaves it on the poster
  // with this button showing "Play"). If the section was reached without
  // scrolling past it, the src may not be attached yet -- attach it and
  // play once React has rendered it (setting src by hand as well would
  // make React's own src write restart the load mid-play).
  const handleTogglePlay = () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    if (!nearViewport) {
      playRequestedRef.current = true;
      setNearViewport(true);
      return;
    }
    if (videoEl.paused) videoEl.play().catch(() => {});
    else videoEl.pause();
  };

  useEffect(() => {
    if (!nearViewport || !playRequestedRef.current) return;
    playRequestedRef.current = false;
    videoRef.current?.play().catch(() => {});
  }, [nearViewport]);

  const showPosterPlay = reduceMotion && !hasPlayed;

  return (
    <section ref={sectionRef} className="relative w-full">
      {/* No src until the section is near (see above). autoPlay starts it
          as soon as the src lands (skipped under reduced motion); muted +
          playsInline are what allow that without a gesture, including
          inline (not fullscreen) on iOS. */}
      <video
        ref={videoRef}
        src={nearViewport ? video.src : undefined}
        poster={video.poster ?? undefined}
        autoPlay={!reduceMotion}
        loop
        muted={muted}
        playsInline
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => {
          setPaused(false);
          setHasPlayed(true);
        }}
        onPause={() => setPaused(true)}
        className="block h-auto w-full"
        style={{ aspectRatio }}
      />

      {/* Reduced motion: an obvious play button on the poster until the
          visitor chooses to start it; after that the corner controls take
          over. */}
      {showPosterPlay && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <IconButton label="Play video" onClick={handleTogglePlay} className="h-16 w-16">
            <PlayPauseIcon paused size={28} />
          </IconButton>
        </div>
      )}

      <div className="absolute bottom-4 right-4 z-10 flex gap-2 md:bottom-6 md:right-6">
        {/* Hidden while the centered button is up, so there aren't two
            identical "Play video" controls on the poster. */}
        {!showPosterPlay && (
          <IconButton label={paused ? "Play video" : "Pause video"} onClick={handleTogglePlay}>
            <PlayPauseIcon paused={paused} />
          </IconButton>
        )}
        {SOUND_ENABLED && (
          <IconButton label={muted ? "Unmute video" : "Mute video"} onClick={handleToggleSound}>
            <SpeakerIcon muted={muted} />
          </IconButton>
        )}
      </div>
    </section>
  );
}

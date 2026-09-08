"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";

const CREAM = "#F7EFE4";

// Root layout (src/app/layout.js) persists across client-side <Link>
// navigations in the App Router, so this only genuinely mounts once per
// document load anyway -- this flag is the belt-and-suspenders guarantee:
// it survives a hard refresh mid-session (sessionStorage, not state), so if
// anything ever forces a remount (an error boundary reset, a future
// template.js, a non-Link navigation) the full ~3s intro doesn't replay.
const SESSION_KEY = "sp_ace_preloader_played";

export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const overlayRef = useRef(null);
  const logoRef = useRef(null);
  // Not rendered — kept only so the exit is paced against a loading
  // progress value, in case something later wants to read this out.
  const progressRef = useRef(0);

  useEffect(() => {
    let alreadyPlayed = false;
    try {
      alreadyPlayed = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // Privacy modes / locked-down browsers can throw on sessionStorage
      // access -- fall back to always playing rather than crashing.
    }

    const finish = () => {
      document.body.style.overflow = "";
      window.__preloaderDone = true;
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // Same fallback as above -- non-fatal if storage is unavailable.
      }
      window.dispatchEvent(new Event("preloader:complete"));
      setVisible(false);
    };

    if (alreadyPlayed) {
      finish();
      return;
    }

    document.body.style.overflow = "hidden";

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let tl;
    let reducedTimer;

    if (reduceMotion) {
      gsap.set(logoRef.current, { opacity: 1, y: 0, filter: "blur(0px)" });
      progressRef.current = 1;

      reducedTimer = setTimeout(() => {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.15,
          ease: "power1.out",
          onComplete: finish,
        });
      }, 500);
    } else {
      tl = gsap.timeline({ onComplete: finish });

      tl.fromTo(
        logoRef.current,
        { opacity: 0, y: 10, filter: "blur(10px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.4,
          ease: "back.out(1.7)",
          delay: 0.25,
        }
      )
        .fromTo(
          progressRef,
          { current: 0 },
          {
            current: 1,
            duration: 1.8,
            ease: "power1.inOut",
          },
          ">-0.1"
        )
        .to({}, { duration: 0.3 })
        .to(logoRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        })
        .to(overlayRef.current, {
          y: "-100%",
          duration: 0.6,
          ease: "power3.out",
        });
    }

    return () => {
      if (tl) tl.kill();
      if (reducedTimer) clearTimeout(reducedTimer);
      document.body.style.overflow = "";
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-6"
      style={{ backgroundColor: CREAM }}
      role="presentation"
      aria-hidden="true"
    >
      <div
        ref={logoRef}
        className="w-[clamp(300px,45vw,900px)]"
        style={{ opacity: 0 }}
      >
        <Image
          src="/logos/logo.png"
          alt="Studio SP_ACE — Architecture | Interiors"
          width={1600}
          height={716}
          priority
          sizes="(max-width: 480px) 300px, (max-width: 1920px) 45vw, 900px"
          className="w-full h-auto"
        />
      </div>
    </div>
  );
}

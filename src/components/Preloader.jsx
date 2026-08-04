"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";

const CREAM = "#F7EFE4";
const TRACK = "#E5DCCB";
const MAROON = "#6E1F24";
const INK = "#2B2622";

export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const overlayRef = useRef(null);
  const logoRef = useRef(null);
  const barWrapRef = useRef(null);
  const fillRef = useRef(null);
  const percentRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const finish = () => {
      document.body.style.overflow = "";
      window.__preloaderDone = true;
      window.dispatchEvent(new Event("preloader:complete"));
      setVisible(false);
    };

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let tl;
    let reducedTimer;

    if (reduceMotion) {
      gsap.set(logoRef.current, { opacity: 1, y: 0, filter: "blur(0px)" });
      gsap.set(fillRef.current, { width: "100%" });
      if (percentRef.current) percentRef.current.textContent = "LOADING — 100%";

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
          fillRef.current,
          { width: "0%" },
          {
            width: "100%",
            duration: 1.8,
            ease: "power1.inOut",
            onUpdate: function () {
              if (!percentRef.current) return;
              const pct = Math.round(this.progress() * 100);
              percentRef.current.textContent = `LOADING — ${pct}%`;
            },
          },
          ">-0.1"
        )
        .to({}, { duration: 0.3 })
        .to([logoRef.current, barWrapRef.current], {
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
        className="w-[clamp(220px,30vw,400px)]"
        style={{ opacity: 0 }}
      >
        <Image
          src="/logos/logo.png"
          alt="Studio Splace — Architecture | Interiors"
          width={1536}
          height={1024}
          preload
          sizes="(max-width: 640px) 220px, 400px"
          className="w-full h-auto"
        />
      </div>

      <div ref={barWrapRef} className="flex flex-col items-center gap-3">
        <div
          className="relative overflow-hidden rounded-full"
          style={{ width: 200, height: 2, backgroundColor: TRACK }}
        >
          <div
            ref={fillRef}
            className="absolute left-0 top-0 h-full"
            style={{ width: "0%", backgroundColor: MAROON }}
          />
        </div>
        <span
          ref={percentRef}
          className="text-[12px] uppercase tracking-[0.2em]"
          style={{ color: INK, fontFamily: "var(--font-inter)" }}
        >
          LOADING — 0%
        </span>
      </div>
    </div>
  );
}

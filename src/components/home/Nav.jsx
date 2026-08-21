"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const CREAM = "#F7EFE4";
const INK = "#2B2622";
const MAROON = "#6E1F24";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Media", href: "/#press" },
  { label: "Contact Us", href: "/contact" },
];

export default function Nav({ lightHero = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  // Lock page scroll behind the full-screen overlay while it's open --
  // same pattern as Preloader.jsx.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    let ticking = false;

    const update = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 80);

      if (currentY > lastScrollY.current && currentY > 120) {
        setHidden(true);
      } else if (currentY < lastScrollY.current) {
        setHidden(false);
      }

      lastScrollY.current = currentY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While the full-screen mobile overlay is open, the ink panel sits
  // directly behind this bar -- keep the bar itself transparent with
  // cream logo/text (same as the un-scrolled state) instead of switching
  // to the solid cream treatment, so it reads as one continuous ink
  // takeover rather than a cream bar sitting on top of an ink panel.
  // `lightHero` covers pages whose hero content is cream-on-cream from
  // y=0 (e.g. About) -- unlike Home/Projects, which have a dark
  // video/image hero for the un-scrolled cream text to sit on, those
  // pages have nothing dark for cream text to read against until the
  // user scrolls, so the solid/ink treatment applies from the start.
  const solid = (scrolled || lightHero) && !menuOpen;
  const textColor = solid ? INK : CREAM;

  return (
    <>
      <header
        className="fixed top-0 left-0 z-[100] w-full"
        style={{
          backgroundColor: solid ? CREAM : "transparent",
          boxShadow: solid
            ? "0 1px 0 rgba(43,38,34,0.08), 0 4px 16px rgba(43,38,34,0.06)"
            : "none",
          transform: hidden && !menuOpen ? "translateY(-100%)" : "translateY(0)",
          transition:
            "transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        <div className="relative z-10 mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 md:px-16">
          <Link
            href="/"
            className="relative z-10 shrink-0"
            style={{
              filter: solid ? "none" : "brightness(0) invert(1)",
              transition: "filter 0.3s",
            }}
          >
            <Image
              src="/logos/logo.png"
              alt="Studio SP_ACE"
              width={165}
              height={40}
              className="h-10 w-auto"
              style={{ width: "auto" }}
              priority
            />
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative text-[14px] uppercase tracking-[0.15em]"
                style={{
                  color: textColor,
                  fontFamily: "var(--font-manrope)",
                  transition: "color 0.3s",
                }}
              >
                {link.label}
                <span
                  className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-200 ease-out group-hover:scale-x-100"
                  style={{ backgroundColor: textColor }}
                />
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            <Link
              href="/contact"
              className="inline-block px-6 py-2.5 text-[14px] uppercase tracking-[0.15em] transition-opacity duration-200 ease-out hover:opacity-90"
              style={{
                backgroundColor: MAROON,
                color: CREAM,
                fontFamily: "var(--font-manrope)",
              }}
            >
              Inquire
            </Link>
          </div>

          <button
            type="button"
            className="relative z-10 flex h-8 w-8 flex-col items-center justify-center gap-1.5 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span
              className="block h-px w-6 transition-transform duration-300"
              style={{
                backgroundColor: textColor,
                transform: menuOpen ? "translateY(6.5px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="block h-px w-6 transition-opacity duration-300"
              style={{ backgroundColor: textColor, opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="block h-px w-6 transition-transform duration-300"
              style={{
                backgroundColor: textColor,
                transform: menuOpen ? "translateY(-6.5px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </div>
      </header>

      {/* Full-screen mobile menu overlay. Rendered as a sibling of <header>,
          not a descendant -- header has its own inline `transform` (for the
          hide-on-scroll slide), and per spec a `position: fixed` descendant
          of a transformed ancestor sizes itself against that ancestor's box
          instead of the viewport. Nesting this inside header collapsed it
          to the header's own ~72px content height instead of covering the
          screen; living outside it, this is fixed straight to the
          viewport. Always mounted (not conditionally rendered) so the
          fade/slide is a real CSS transition rather than a hard
          mount/unmount cut -- pointer-events + aria-hidden keep it out of
          the way (click-through and screen readers) while closed. The
          close affordance is the same hamburger button above morphing into
          an X, not a separate icon. */}
      <div
        className="fixed inset-0 z-[99] flex flex-col items-center justify-center gap-10 px-6 md:hidden"
        style={{
          backgroundColor: INK,
          opacity: menuOpen ? 1 : 0,
          transform: reduceMotion
            ? "none"
            : menuOpen
              ? "translateY(0)"
              : "translateY(-16px)",
          transition: reduceMotion
            ? "none"
            : "opacity 0.35s ease, transform 0.35s ease",
          pointerEvents: menuOpen ? "auto" : "none",
        }}
        aria-hidden={!menuOpen}
      >
        <nav className="flex flex-col items-center gap-7">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              tabIndex={menuOpen ? 0 : -1}
              className="text-3xl uppercase tracking-[0.1em]"
              style={{ color: CREAM, fontFamily: "var(--font-manrope)" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/contact"
          onClick={() => setMenuOpen(false)}
          tabIndex={menuOpen ? 0 : -1}
          className="mt-4 inline-block px-8 py-4 text-sm uppercase tracking-[0.15em]"
          style={{
            backgroundColor: MAROON,
            color: CREAM,
            fontFamily: "var(--font-manrope)",
          }}
        >
          Inquire
        </Link>
      </div>
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import useReducedMotion from "@/hooks/useReducedMotion";

const CREAM = "#F7EFE4";
const INK = "#2B2622";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Media", href: "/media" },
  { label: "Contact Us", href: "/contact" },
];

export default function Nav({ lightHero = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const lastScrollY = useRef(0);

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

    let frame = 0;
    const onScroll = () => {
      if (!ticking) {
        frame = window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  // With the mobile menu open, keep the bar transparent with cream text so it
  // reads as one continuous ink overlay. `lightHero` makes the bar solid from
  // y=0, for a page whose hero is cream (no page uses it right now).
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
              width={284}
              height={127}
              className="h-16 w-auto md:h-[72px]"
              style={{ width: "auto" }}
              priority
            />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
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

          <div className="hidden lg:block">
            <Button href="/contact" variant="primary">
              Inquire
            </Button>
          </div>

          <button
            type="button"
            className="relative z-10 flex h-11 w-11 flex-col items-center justify-center gap-1.5 lg:hidden"
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

      {/* Mobile menu overlay, rendered outside <header>: header is
          transformed (hide-on-scroll), and a fixed child of a transformed
          element sizes to that element instead of the viewport. Always
          mounted so open/close is a CSS transition; pointer-events and
          aria-hidden take it out of the way when closed. */}
      <div
        className="fixed inset-0 z-[99] flex flex-col items-center justify-center gap-8 px-6 lg:hidden"
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
        <nav className="flex flex-col items-center gap-5">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              tabIndex={menuOpen ? 0 : -1}
              className="py-1 text-3xl uppercase tracking-[0.1em]"
              style={{ color: CREAM, fontFamily: "var(--font-manrope)" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Button
          href="/contact"
          variant="primary"
          size="lg"
          onClick={() => setMenuOpen(false)}
          tabIndex={menuOpen ? 0 : -1}
          className="mt-4"
        >
          Inquire
        </Button>
      </div>
    </>
  );
}

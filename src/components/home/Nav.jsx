"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const CREAM = "#F7EFE4";
const INK = "#2B2622";
const MAROON = "#6E1F24";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Media", href: "/media" },
  { label: "Contact Us", href: "/contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || menuOpen;
  const textColor = solid ? INK : CREAM;

  return (
    <header
      className="fixed top-0 left-0 z-[100] w-full transition-colors duration-300"
      style={{
        backgroundColor: solid ? CREAM : "transparent",
        boxShadow: solid
          ? "0 1px 0 rgba(43,38,34,0.08), 0 4px 16px rgba(43,38,34,0.06)"
          : "none",
      }}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 md:px-10">
        <Link
          href="/"
          className="relative z-10 shrink-0"
          style={{
            filter: solid ? "none" : "drop-shadow(0 1px 6px rgba(0,0,0,0.35))",
            transition: "filter 0.3s",
          }}
        >
          <Image
            src="/logos/logo.png" 
            alt="Studio Splace"
            width={160}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative text-[11px] uppercase tracking-[0.15em]"
              style={{
                color: textColor,
                fontFamily: "var(--font-inter)",
                transition: "color 0.3s",
              }}
            >
              {link.label}
              <span
                className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100"
                style={{ backgroundColor: textColor }}
              />
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/contact"
            className="inline-block px-6 py-2.5 text-[11px] uppercase tracking-[0.15em] transition-opacity hover:opacity-90"
            style={{
              backgroundColor: MAROON,
              color: CREAM,
              fontFamily: "var(--font-inter)",
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

      {menuOpen && (
        <div
          className="flex flex-col gap-1 px-6 pb-6 md:hidden"
          style={{ backgroundColor: CREAM }}
        >
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="border-b py-3 text-[12px] uppercase tracking-[0.15em]"
              style={{
                color: INK,
                borderColor: "rgba(43,38,34,0.08)",
                fontFamily: "var(--font-inter)",
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="mt-4 inline-block px-6 py-3 text-center text-[11px] uppercase tracking-[0.15em]"
            style={{
              backgroundColor: MAROON,
              color: CREAM,
              fontFamily: "var(--font-inter)",
            }}
          >
            Inquire
          </Link>
        </div>
      )}
    </header>
  );
}

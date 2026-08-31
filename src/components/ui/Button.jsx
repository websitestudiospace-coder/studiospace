"use client";

import Link from "next/link";

const CREAM = "#F7EFE4";
const INK = "#2B2622";
const MAROON = "#6E1F24";

const VARIANT_CLASSES = {
  primary:
    "inline-block uppercase tracking-[0.15em] transition-opacity duration-200 ease-out hover:opacity-90",
  secondary:
    "inline-block rounded-full transition-opacity duration-200 ease-out hover:opacity-70",
  text: "inline-block border-b pb-1 uppercase tracking-[0.15em] transition-opacity duration-200 ease-out hover:opacity-70",
  icon: "inline-flex shrink-0 items-center justify-center rounded-full transition-opacity duration-200 ease-out hover:opacity-60",
};

const VARIANT_STYLE = {
  primary: { backgroundColor: MAROON, color: CREAM, fontFamily: "var(--font-manrope)" },
  secondary: {
    backgroundColor: "rgba(43, 38, 34, 0.06)",
    color: INK,
    fontFamily: "var(--font-manrope)",
  },
  text: { borderColor: CREAM, color: CREAM, fontFamily: "var(--font-manrope)" },
  icon: { border: "1px solid rgba(43,38,34,0.15)" },
};

const SIZE_CLASSES = {
  primary: {
    md: "px-6 py-2.5 text-[14px]",
    lg: "px-8 py-4 text-sm",
  },
  secondary: {
    md: "px-4 py-2 text-xs",
  },
  text: {
    md: "text-xs",
  },
  icon: {
    md: "p-3.5",
  },
};

// Shared button/link for the site's 4 recurring styles: filled maroon
// "primary", translucent-pill "secondary", underlined "text" link, and
// circular icon-only "icon". Renders a Next <Link> when `href` is given,
// otherwise a <button> (defaults to type="button"; pass type="submit" for
// form submits). `className` is appended last so callers can add
// layout-only utilities (e.g. spacing) without fighting the base styles.
export default function Button({
  variant = "primary",
  size = "md",
  href,
  children,
  onClick,
  className = "",
  type = "button",
  style,
  ...rest
}) {
  const classes = [
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[variant]?.[size] ?? "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const mergedStyle = { ...VARIANT_STYLE[variant], ...style };

  if (href) {
    return (
      <Link href={href} className={classes} style={mergedStyle} onClick={onClick} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      style={mergedStyle}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}

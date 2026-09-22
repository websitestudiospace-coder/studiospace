"use client";

import { usePathname } from "next/navigation";
import Preloader from "@/components/Preloader";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";

// The Sanity Studio at /studio is a full third-party SPA that manages its
// own fixed panels and scrolling -- the site's own preloader/Lenis smooth
// scroll/scroll-progress bar would fight it (double scrollbars, mispositioned
// fixed elements), so this is the one place they're skipped entirely rather
// than applied globally in the root layout.
export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith("/studio");

  if (isStudio) return children;

  return (
    <>
      <Preloader />
      <ScrollProgress />
      <SmoothScroll>{children}</SmoothScroll>
    </>
  );
}

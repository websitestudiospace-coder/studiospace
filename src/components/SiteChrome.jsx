"use client";

import { usePathname } from "next/navigation";
import Preloader from "@/components/Preloader";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";

// /studio (Sanity Studio) manages its own scrolling and fixed panels, so the
// preloader, Lenis and progress bar are skipped there.
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

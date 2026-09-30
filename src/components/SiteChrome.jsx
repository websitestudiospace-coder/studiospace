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
  // TEMPORARY: the pre-launch holding page at "/" is a single static screen.
  const isHoldingPage = pathname === "/";

  if (isStudio || isHoldingPage) return children;

  return (
    <>
      <Preloader />
      <ScrollProgress />
      <SmoothScroll>{children}</SmoothScroll>
    </>
  );
}

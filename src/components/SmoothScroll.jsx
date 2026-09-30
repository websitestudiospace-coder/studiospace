"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setLenis } from "@/lib/lenis";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    // The only Lenis instance in the app. Other components subscribe to it
    // via src/lib/lenis.js -- never create a second one.
    setLenis(lenis);
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const syncLenis = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(syncLenis);
    gsap.ticker.lagSmoothing(0);

    // Runs after all children's mount effects, so every ScrollTrigger exists
    // by now. Refresh again once fonts load, since Agatho can shift heights.
    ScrollTrigger.refresh();
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    // Recompute Lenis's scroll limit whenever the page height changes. Lenis's
    // own autoResize observes <html>, whose box stays viewport-sized, so it
    // misses content growth; <body> grows with its content. This instance
    // persists across client-side navigations, and the new page's content can
    // finish streaming after the route change, so a persistent observer is
    // needed -- otherwise a taller page's end is unreachable by wheel scroll.
    const bodyResizeObserver = new ResizeObserver(() => lenis.resize());
    bodyResizeObserver.observe(document.body);

    return () => {
      bodyResizeObserver.disconnect();
      gsap.ticker.remove(syncLenis);
      lenis.destroy();
      setLenis(null);
      lenisRef.current = null;
    };
  }, []);

  // Cancel any in-flight glide on route change. This Lenis instance outlives
  // navigations, so a link clicked mid-glide (e.g. "Next Project") let Lenis
  // keep easing toward the old page's bottom after the router had scrolled
  // the new page to the top. reset() re-syncs Lenis to the real position.
  // A layout effect in this parent runs after the router's own scroll-to-top
  // in the same commit, before Lenis's next frame. It syncs to wherever the
  // page is rather than forcing 0, so back/forward restoration still works.
  useLayoutEffect(() => {
    lenisRef.current?.reset();
  }, [pathname]);

  return children;
}

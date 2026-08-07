"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CREAM = "#F7EFE4";
const INK = "#2B2622";

// TODO: replace with real client/brand names once provided
const CLIENTS = [
  { name: "Client 1", image: "/images/clients/client-1.jpg" },
  { name: "Client 2", image: "/images/clients/client-2.jpg" },
  { name: "Client 3", image: "/images/clients/client-3.jpg" },
];

export default function ClientsGrid() {
  const sectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mobileMql = window.matchMedia("(max-width: 767px)");
    const motionMql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMobile = () => setIsMobile(mobileMql.matches);
    const updateMotion = () => setReduceMotion(motionMql.matches);
    updateMobile();
    updateMotion();
    mobileMql.addEventListener("change", updateMobile);
    motionMql.addEventListener("change", updateMotion);
    return () => {
      mobileMql.removeEventListener("change", updateMobile);
      motionMql.removeEventListener("change", updateMotion);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray(".client-card");
      const center = (cards.length - 1) / 2;

      gsap.set(cards, { yPercent: 40, opacity: 0 });

      cards.forEach((card, i) => {
        const delay = isMobile ? i * 0.1 : Math.abs(i - center) * 0.15;

        gsap.to(card, {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          delay,
          ease: "sine.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reduceMotion, isMobile]);

  return (
    <section
      ref={sectionRef}
      className="w-full px-6 py-12 md:px-16 md:py-[100px]"
      style={{ backgroundColor: CREAM }}
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-3">
          {CLIENTS.map((client) => (
            <div key={client.name} className="client-card">
              <div
                className="group relative aspect-[4/5] w-full overflow-hidden rounded-[8px] border transition-shadow duration-500 ease-out hover:shadow-xl"
                style={{ borderColor: "rgba(43,38,34,0.12)" }}
              >
                <Image
                  src={client.image}
                  alt={client.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              </div>
              {/* TODO: replace with real client/brand names once provided */}
              <p
                className="mt-4 text-center text-xs uppercase tracking-[0.15em]"
                style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.7 }}
              >
                {client.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

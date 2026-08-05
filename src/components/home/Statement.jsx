"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "@/components/ui/ScrollReveal.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const INK = "#2B2622";
const CREAM = "#F7EFE4";

const HEADING_TEXT =
  "We craft spaces that inspire life and stand the test of time.";

export default function Statement() {
  const wrapperRef = useRef(null);
  const sectionRef = useRef(null);
  const eyebrowRef = useRef(null);
  const headingRef = useRef(null);
  const paragraphRef = useRef(null);
  const linkRef = useRef(null);
  const image1Ref = useRef(null);
  const image2Ref = useRef(null);

  const headingWords = useMemo(
    () =>
      HEADING_TEXT.split(/(\s+)/).map((chunk, index) =>
        /^\s+$/.test(chunk) ? (
          chunk
        ) : (
          <span className="word" key={index}>
            {chunk}
          </span>
        )
      ),
    []
  );

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const wordEls = headingRef.current.querySelectorAll(".word");

    if (reduceMotion) {
      gsap.set(wrapperRef.current, { height: "auto" });
      gsap.set(
        [
          eyebrowRef.current,
          paragraphRef.current,
          linkRef.current,
          image1Ref.current,
          image2Ref.current,
        ],
        { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
      );
      gsap.set(wordEls, { opacity: 1, rotate: 0, filter: "blur(0px)" });
      return;
    }

    const mm = gsap.matchMedia();

    mm.add(
      {
        isPinned: "(min-width: 768px)",
        isMobile: "(max-width: 767px)",
      },
      (context) => {
        const { isPinned } = context.conditions;

        if (isPinned) {
          gsap.set(eyebrowRef.current, { opacity: 0, filter: "blur(6px)" });
          gsap.set(wordEls, {
            opacity: 0.15,
            rotate: 4,
            transformOrigin: "0% 50%",
            filter: "blur(8px)",
          });
          gsap.set(paragraphRef.current, {
            opacity: 0,
            y: 15,
            filter: "blur(6px)",
          });
          gsap.set([linkRef.current, image1Ref.current, image2Ref.current], {
            opacity: 0,
            y: 20,
          });
          gsap.set([image1Ref.current, image2Ref.current], { scale: 1.05 });

          const scrollTriggerConfig = {
            trigger: wrapperRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          };

          const pinTrigger = ScrollTrigger.create({
            ...scrollTriggerConfig,
            pin: sectionRef.current,
          });

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: scrollTriggerConfig,
          });

          // Phase 1 (0-15%): eyebrow
          tl.to(eyebrowRef.current, {
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.15,
          });

          // Phase 2 (15-65%): heading words, staggered
          tl.to(wordEls, {
            opacity: 1,
            rotate: 0,
            filter: "blur(0px)",
            duration: 0.2,
            stagger: { amount: 0.3, from: "start" },
          });

          // Phase 3 (65-85%): paragraph
          tl.to(paragraphRef.current, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.2,
          });

          // Phase 4 (85-100%): link + images
          tl.to([linkRef.current, image1Ref.current, image2Ref.current], {
            opacity: 1,
            y: 0,
            duration: 0.15,
          });
          tl.to(
            [image1Ref.current, image2Ref.current],
            { scale: 1, duration: 0.15 },
            "<"
          );

          return () => {
            pinTrigger.kill();
          };
        }

        // Mobile: no pin, simple one-time fade-in per element on scroll into view
        gsap.set(wrapperRef.current, { height: "auto" });

        const fadeTriggers = [];

        fadeTriggers.push(
          gsap.fromTo(
            eyebrowRef.current,
            { opacity: 0, filter: "blur(6px)" },
            {
              opacity: 1,
              filter: "blur(0px)",
              duration: 0.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: eyebrowRef.current,
                start: "top 85%",
                toggleActions: "play none none none",
              },
            }
          ),
          gsap.fromTo(
            wordEls,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.6,
              stagger: 0.03,
              ease: "power2.out",
              scrollTrigger: {
                trigger: headingRef.current,
                start: "top 85%",
                toggleActions: "play none none none",
              },
            }
          ),
          gsap.fromTo(
            paragraphRef.current,
            { opacity: 0, y: 15 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: paragraphRef.current,
                start: "top 85%",
                toggleActions: "play none none none",
              },
            }
          ),
          gsap.fromTo(
            [linkRef.current, image1Ref.current, image2Ref.current],
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: linkRef.current,
                start: "top 85%",
                toggleActions: "play none none none",
              },
            }
          )
        );

        return () => {
          fadeTriggers.forEach((tween) => tween.scrollTrigger?.kill());
        };
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full md:h-[200vh] lg:h-[350vh]">
      <section
        ref={sectionRef}
        className="flex w-full items-center py-16 md:h-screen md:py-0"
        style={{ backgroundColor: CREAM }}
      >
        <div className="mx-auto w-full max-w-[1600px] px-6 md:px-10">
          <div
            ref={eyebrowRef}
            className="mb-10 flex items-center gap-3 md:mb-16"
          >
            <span
              className="text-[11px] uppercase tracking-[0.2em]"
              style={{ color: INK, fontFamily: "var(--font-agatho)" }}
            >
              Our Philosophy
            </span>
            <span
              className="h-px w-10"
              style={{ backgroundColor: INK, opacity: 0.4 }}
            />
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-6">
            <div className="lg:col-span-5">
              <h2 ref={headingRef} className="scroll-reveal overflow-hidden">
                <p className="scroll-reveal-text">{headingWords}</p>
              </h2>
            </div>

            <div className="lg:col-span-3 lg:col-start-6">
              <p
                ref={paragraphRef}
                className="text-[13px] leading-relaxed md:text-[14px]"
                style={{
                  color: INK,
                  opacity: 0.7,
                  fontFamily: "var(--font-corporate)",
                }}
              >
                We believe a home should feel honest — built from materials
                that age with grace, and details considered until they
                disappear into the whole. Every project begins with how a
                space will actually be lived in, long after the last coat of
                paint has dried. It&apos;s a slower way of working, but
                it&apos;s the only way we know that lasts.
              </p>
              <Link
                ref={linkRef}
                href="/about"
                className="group mt-6 inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.15em]"
                style={{ color: INK, fontFamily: "var(--font-agatho)" }}
              >
                <span className="relative">
                  About Our Studio
                  <span
                    className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100"
                    style={{ backgroundColor: INK }}
                  />
                </span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-4 lg:col-start-9">
              <div
                ref={image1Ref}
                className="group relative aspect-[4/5] overflow-hidden"
              >
                <Image
                  src="/images/about/philosophy-1.jpg"
                  alt="Studio Splace — considered interior detail"
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 15vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <div
                ref={image2Ref}
                className="group relative mt-8 aspect-[3/4] overflow-hidden lg:mt-12"
              >
                <Image
                  src="/images/about/philosophy-2.jpg"
                  alt="Studio Splace — architectural craftsmanship"
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 15vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

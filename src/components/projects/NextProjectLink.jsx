"use client";

import { CldImage } from "next-cloudinary";
import Link from "next/link";

const CREAM = "#F7EFE4";
const INK = "#2B2622";

export default function NextProjectLink({ project }) {
  return (
    <section className="w-full px-6 py-16 md:px-16 md:py-24" style={{ backgroundColor: CREAM }}>
      <Link
        href={`/projects/${project.slug}`}
        className="group mx-auto flex w-full max-w-[1100px] flex-col items-center gap-6 text-center"
      >
        <p
          className="text-xs uppercase tracking-[0.15em]"
          style={{ fontFamily: "var(--font-manrope)", color: INK, opacity: 0.65 }}
        >
          Next Project
        </p>

        <div className="relative h-[220px] w-full max-w-[420px] overflow-hidden rounded-[8px] md:h-[280px]">
          {project.cover ? (
            <CldImage
              src={project.cover}
              alt={project.name}
              fill
              sizes="(max-width: 768px) 90vw, 420px"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0" style={{ backgroundColor: INK }} />
          )}
        </div>

        <h2
          className="uppercase"
          style={{
            fontFamily: "var(--font-agatho)",
            color: INK,
            fontSize: "clamp(28px, 4vw, 44px)",
            lineHeight: 1.1,
          }}
        >
          {project.name}
        </h2>
      </Link>
    </section>
  );
}

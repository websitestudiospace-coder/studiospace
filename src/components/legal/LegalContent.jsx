const CREAM = "#F7EFE4";
const INK = "#2B2622";
const MAROON = "#6E1F24";

const HEADING_CLASS = "text-[32px] md:text-[48px]";

export function LegalSection({ heading, children }) {
  return (
    <section className="mt-10 first:mt-0 md:mt-12">
      <h2
        className="text-lg md:text-xl"
        style={{ fontFamily: "var(--font-agatho)", color: CREAM }}
      >
        {heading}
      </h2>
      <div
        className="mt-3 flex flex-col gap-3 text-sm leading-relaxed md:text-base"
        style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.7 }}
      >
        {children}
      </div>
    </section>
  );
}

export default function LegalContent({ title, updated, children }) {
  return (
    <section
      className="w-full px-6 pt-32 pb-20 md:px-16 md:pt-44 md:pb-32"
      style={{ backgroundColor: INK }}
    >
      <div className="mx-auto w-full max-w-[900px]">
        <div
          className="rounded-[8px] border px-5 py-4 text-xs uppercase tracking-[0.1em] md:text-sm"
          style={{
            borderColor: MAROON,
            backgroundColor: "rgba(110, 31, 36, 0.25)",
            color: CREAM,
            fontFamily: "var(--font-manrope)",
          }}
        >
          This is placeholder legal content pending review by a qualified
          lawyer before launch.
        </div>

        <h1
          className={`${HEADING_CLASS} mt-10`}
          style={{ fontFamily: "var(--font-agatho)", color: CREAM, lineHeight: 1.1 }}
        >
          {title}
        </h1>
        <p
          className="mt-3 text-xs uppercase tracking-[0.15em] md:text-sm"
          style={{ fontFamily: "var(--font-manrope)", color: CREAM, opacity: 0.55 }}
        >
          Last updated: {updated}
        </p>

        <div className="mt-4">{children}</div>
      </div>
    </section>
  );
}

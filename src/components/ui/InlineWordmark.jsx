// Renders "SP_ACE" (or any text) as normal readable text with each
// underscore drawn as a small decorative bar. The bundled Agatho font's
// underscore glyph is a "buy font" watermark, not a real underscore, so it
// can't be used as-is. Sized relative to the surrounding text via em units.
export default function InlineWordmark({ text }) {
  return text.split("").map((char, i) =>
    char === "_" ? (
      <span
        key={i}
        aria-hidden="true"
        style={{
          display: "inline-block",
          position: "relative",
          top: "0.14em",
          width: "0.32em",
          height: "0.09em",
          backgroundColor: "currentColor",
        }}
      />
    ) : (
      char
    )
  );
}

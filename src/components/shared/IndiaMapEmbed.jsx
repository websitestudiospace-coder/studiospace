const MAP_EMBED_SRC = "https://www.google.com/maps?q=Bangalore,India&z=4&output=embed";

// Shared keyless Google Maps embed (no API key), grayscale-filtered --
// used by both the About page's "Where We Work" section (heading/caption/
// CTA wrapped around it, see IndiaMap.jsx) and the Contact page (map-only,
// no surrounding copy). z=4 plus a taller-than-wide box is what actually
// gets all of India in frame from a Bangalore-centered viewport (z=5
// cropped the north; a fractional z=4.5 is rejected outright by Google's
// server) -- see PROJECT_STATUS.md for the full tuning history. A custom
// brand-styled marker overlay was tried and removed: its position matched
// the iframe's own CSS center exactly, but in a real browser the map's own
// content didn't render centered at that same pixel, so the overlay showed
// up floating over open ocean nowhere near Bangalore. Google's own default
// place marker (real data, correctly positioned) is the only marker.
export default function IndiaMapEmbed({ heightClassName = "h-[55vh] md:h-[75vh]" }) {
  return (
    <div className={`relative w-full overflow-hidden ${heightClassName}`}>
      <iframe
        src={MAP_EMBED_SRC}
        title="Studio SP_ACE location — Bangalore, India"
        width="100%"
        height="100%"
        style={{ border: 0, filter: "sepia(0.15) grayscale(1) contrast(1.05) brightness(1.02)" }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}

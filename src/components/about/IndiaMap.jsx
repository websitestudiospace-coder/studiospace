import LocationsMap from "@/components/shared/LocationsMap";

// This section's actual implementation now lives in the shared
// LocationsMap component (also used on the Contact page) -- this file just
// wires in the About page's own CTA. The earlier react-simple-maps/
// TopoJSON concentric-circle map (client disliked it) has been fully
// removed, not extended.
export default function IndiaMap() {
  return <LocationsMap showCta ctaHref="/projects" ctaLabel="View All Projects" />;
}

import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import ContactContent from "@/components/contact/ContactContent";
import LocationsMap from "@/components/shared/LocationsMap";

// TODO: placeholder OG/Twitter share image, same as layout.js -- Next.js
// doesn't deep-merge nested `openGraph`/`twitter` objects, so a page that
// sets its own must repeat `images` or it silently loses the root layout's
// default. Swap for a purpose-made image from the client before launch.
const DEFAULT_OG_IMAGE = "/images/projects/the-modern-eclectic-home/3H4A2226-1.webp";

export const metadata = {
  title: "Contact | Studio SP_ACE",
  description: "Get in touch with Studio SP_ACE to start your architecture and interior design project.",
  openGraph: {
    title: "Contact | Studio SP_ACE",
    description: "Get in touch with Studio SP_ACE to start your architecture and interior design project.",
    siteName: "Studio SP_ACE",
    images: [{ url: DEFAULT_OG_IMAGE }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Studio SP_ACE",
    description: "Get in touch with Studio SP_ACE to start your architecture and interior design project.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function ContactPage() {
  return (
    <>
      <Nav />
      <ContactContent />
      {/* No CTA here (unlike the About page's use of this same component)
          -- "View All Projects" doesn't fit naturally right after the
          contact form/map, and the brief calls that out as configurable
          per page rather than forced onto every usage. */}
      <LocationsMap />
      <Footer />
    </>
  );
}

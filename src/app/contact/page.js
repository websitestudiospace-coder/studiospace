import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import ContactContent from "@/components/contact/ContactContent";
import { toCloudinaryUrl } from "@/lib/projects";

// ContactContent is a "use client" component (GSAP/DOM refs) and
// toCloudinaryUrl() reads scripts/cloudinary-url-map.json off disk via
// Node's fs -- server-only, can't run inside a client component. Resolved
// here instead (this page is a server component) and passed down as a
// plain prop URL, the same pattern about/page.js already uses for
// WhatWeBelieve's beliefImages. Not a project photo (no slug), so this
// can't go through getProjectPhoto() -- it's a flat toCloudinaryUrl() call
// on the same "public/images/contact/8.webp" key
// scripts/upload-to-cloudinary.js recorded when this photo was uploaded.
const CONTACT_HERO_PHOTO = {
  src: toCloudinaryUrl("/images/contact/8.webp"),
  alt: "A wood-paneled console styled with marble wall sconces, candlesticks, and a ceramic bowl",
};

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
      <ContactContent heroPhoto={CONTACT_HERO_PHOTO} />
      <Footer />
    </>
  );
}

import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import ContactContent from "@/components/contact/ContactContent";
import { getProjectPhoto } from "@/lib/projects";

// Hero photo, resolved here because getProjectPhoto() reads the filesystem.
// Landscape, so it crops well into the wide banner.
const CONTACT_HERO_PHOTO = {
  src: getProjectPhoto("the-modern-transitional-home", "19.webp"),
  alt: "A warm, arched bedroom nook with a cane-panelled wardrobe, terracotta bedding, and pleated bedside lamps, opening onto a neutral linen sofa",
};

export const metadata = {
  title: "Contact | Studio SP_ACE",
  description: "Get in touch with Studio SP_ACE to start your architecture and interior design project.",
  openGraph: {
    title: "Contact | Studio SP_ACE",
    description: "Get in touch with Studio SP_ACE to start your architecture and interior design project.",
    siteName: "Studio SP_ACE",
    images: [{ url: "/images/contact-share.jpg", width: 678, height: 452, alt: "Contact Studio SP_ACE" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Studio SP_ACE",
    description: "Get in touch with Studio SP_ACE to start your architecture and interior design project.",
    images: ["/images/contact-share.jpg"],
  },
};

export default function ContactPage() {
  return (
    <>
      <Nav />
      <ContactContent heroPhoto={CONTACT_HERO_PHOTO} />
      {/* The enquiry form already sits just above as "Design With Us". */}
      <Footer hideForm />
    </>
  );
}

import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import ContactContent from "@/components/contact/ContactContent";

export const metadata = {
  title: "Contact | Studio SP_ACE",
  description: "Get in touch with Studio SP_ACE to start your architecture and interior design project.",
};

export default function ContactPage() {
  return (
    <>
      <Nav />
      <ContactContent />
      <Footer />
    </>
  );
}

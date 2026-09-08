import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import LegalContent, { LegalSection } from "@/components/legal/LegalContent";

export const metadata = {
  title: "Terms of Service | Studio SP_ACE",
  description: "Terms of Service for the Studio SP_ACE website.",
};

export default function TermsPage() {
  return (
    <>
      <Nav />
      <LegalContent title="Terms of Service" updated="August 20, 2026">
        <LegalSection heading="1. Acceptance of Terms">
          <p>
            By accessing or using the Studio SP_ACE website (the
            &quot;Site&quot;), you agree to be bound by these Terms of
            Service. If you do not agree to these terms, please do not use
            the Site.
          </p>
        </LegalSection>

        <LegalSection heading="2. Use of the Site">
          <p>
            The Site and its contents are provided for informational purposes
            to showcase the architecture and interior design work of Studio
            SP_ACE. You agree to use the Site only for lawful purposes and in
            a way that does not infringe the rights of, or restrict or
            inhibit the use and enjoyment of, the Site by any third party.
          </p>
        </LegalSection>

        <LegalSection heading="3. Intellectual Property">
          <p>
            All content on this Site, including but not limited to project
            photography, text, graphics, logos, and the Studio SP_ACE name
            and wordmark, is the property of Studio SP_ACE or its licensors
            and is protected by applicable intellectual property laws. No
            content from this Site may be reproduced, distributed, or used
            for commercial purposes without prior written consent.
          </p>
        </LegalSection>

        <LegalSection heading="4. Limitation of Liability">
          <p>
            The Site and its content are provided &quot;as is&quot; without
            warranties of any kind, express or implied. Studio SP_ACE shall
            not be liable for any direct, indirect, incidental, or
            consequential damages arising from your use of, or inability to
            use, the Site.
          </p>
        </LegalSection>

        <LegalSection heading="5. Changes to These Terms">
          <p>
            We may update these Terms of Service from time to time. Any
            changes will be posted on this page with an updated revision
            date. Continued use of the Site after changes are posted
            constitutes acceptance of the revised terms.
          </p>
        </LegalSection>

        <LegalSection heading="6. Governing Law">
          <p>
            These terms are governed by the laws of India, without regard to
            its conflict of law principles.
          </p>
        </LegalSection>

        <LegalSection heading="7. Contact">
          <p>
            For legal inquiries regarding these Terms of Service, please
            reach out via the{" "}
            <a
              href="/contact"
              className="underline underline-offset-2 transition-opacity duration-200 ease-out hover:opacity-70"
            >
              contact page
            </a>
            .
          </p>
        </LegalSection>
      </LegalContent>
      <Footer />
    </>
  );
}

import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import LegalContent, { LegalSection } from "@/components/legal/LegalContent";

export const metadata = {
  title: "Privacy Policy | Studio SP_ACE",
  description:
    "Read Studio SP_ACE's Privacy Policy to learn how we collect, use, and protect information submitted through this website.",
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <LegalContent title="Privacy Policy" updated="August 20, 2026">
        <LegalSection heading="1. Information We Collect">
          <p>
            When you submit the contact or newsletter forms on this Site, we
            collect the information you provide, such as your name, email
            address, phone number, and any message you include. We do not
            currently collect information beyond what you voluntarily submit.
          </p>
        </LegalSection>

        <LegalSection heading="2. Cookies">
          <p>
            This Site may use cookies and similar technologies to support
            basic functionality and to understand how visitors use the Site.
            You can control or disable cookies through your browser settings;
            doing so may affect some Site functionality.
          </p>
        </LegalSection>

        <LegalSection heading="3. How We Use Your Information">
          <p>
            Information submitted through this Site is used solely to
            respond to your inquiry, discuss potential projects, or send
            studio updates you have opted into. We do not sell your personal
            information to third parties.
          </p>
        </LegalSection>

        <LegalSection heading="4. Third-Party Services">
          <p>
            This Site may link to or embed third-party services (for
            example, Instagram or map providers). Those services have their
            own privacy policies governing any data they collect, and we
            encourage you to review them.
          </p>
        </LegalSection>

        <LegalSection heading="5. Data Security">
          <p>
            We take reasonable measures to protect the information submitted
            through this Site. However, no method of transmission over the
            internet is completely secure, and we cannot guarantee absolute
            security.
          </p>
        </LegalSection>

        <LegalSection heading="6. Your Rights">
          <p>
            You may request access to, correction of, or deletion of any
            personal information you have submitted to us by reaching out
            through the contact page.
          </p>
        </LegalSection>

        <LegalSection heading="7. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. Any changes
            will be posted on this page with an updated revision date.
          </p>
        </LegalSection>

        <LegalSection heading="8. Contact">
          <p>
            For legal inquiries regarding this Privacy Policy, please reach
            out via the{" "}
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

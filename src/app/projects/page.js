import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import ProjectsHero from "@/components/projects/ProjectsHero";
import ProjectsGrid from "@/components/projects/ProjectsGrid";
import { getAllProjects } from "@/lib/projects";

// TODO: placeholder OG/Twitter share image, same as layout.js -- Next.js
// doesn't deep-merge nested `openGraph`/`twitter` objects, so a page that
// sets its own must repeat `images` or it silently loses the root layout's
// default. Swap for a purpose-made image from the client before launch.
const DEFAULT_OG_IMAGE = "/images/projects/the-modern-eclectic-home/3H4A2226-1.webp";

export const metadata = {
  title: "Projects | Studio SP_ACE",
  description: "Explore Studio SP_ACE's portfolio of architecture and interior design projects.",
  openGraph: {
    title: "Projects | Studio SP_ACE",
    description: "Explore Studio SP_ACE's portfolio of architecture and interior design projects.",
    siteName: "Studio SP_ACE",
    images: [{ url: DEFAULT_OG_IMAGE }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | Studio SP_ACE",
    description: "Explore Studio SP_ACE's portfolio of architecture and interior design projects.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <>
      <Nav />
      <ProjectsHero />
      <ProjectsGrid projects={projects} />
      <Footer />
    </>
  );
}

import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import ProjectsHero from "@/components/projects/ProjectsHero";
import ProjectsGrid from "@/components/projects/ProjectsGrid";
import { getAllProjects } from "@/lib/projects";
import { DEFAULT_SHARE_IMAGE } from "@/lib/site";

export const metadata = {
  title: "Projects | Studio SP_ACE",
  description: "Explore Studio SP_ACE's portfolio of architecture and interior design projects.",
  openGraph: {
    title: "Projects | Studio SP_ACE",
    description: "Explore Studio SP_ACE's portfolio of architecture and interior design projects.",
    siteName: "Studio SP_ACE",
    images: [{ url: DEFAULT_SHARE_IMAGE }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | Studio SP_ACE",
    description: "Explore Studio SP_ACE's portfolio of architecture and interior design projects.",
    images: [DEFAULT_SHARE_IMAGE],
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

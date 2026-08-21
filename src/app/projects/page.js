import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import ProjectsHero from "@/components/projects/ProjectsHero";
import ProjectsGrid from "@/components/projects/ProjectsGrid";
import { getAllProjects } from "@/lib/projects";

export const metadata = {
  title: "Projects | Studio SP_ACE",
  description: "Explore Studio SP_ACE's portfolio of architecture and interior design projects.",
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <>
      <Nav />
      <ProjectsHero />
      <ProjectsGrid projects={projects} />
      <Footer />
    </>
  );
}

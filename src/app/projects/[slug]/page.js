import { notFound } from "next/navigation";
import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import ProjectDetail from "@/components/projects/ProjectDetail";
import { PROJECTS } from "@/data/projects";
import { getProjectBySlug, getNextProject } from "@/lib/projects";

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  const title = `${project.name} — Studio SP_ACE`;
  return {
    title,
    openGraph: { title, description: project.description },
    twitter: { title, description: project.description },
  };
}

export default async function ProjectDetailPage({ params }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const nextProject = await getNextProject(slug);

  return (
    <>
      <Nav />
      <ProjectDetail project={project} nextProject={nextProject} />
      <Footer />
    </>
  );
}

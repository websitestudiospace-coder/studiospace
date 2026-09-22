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
  const project = getProjectBySlug(slug);
  if (!project) return {};
  const title = `${project.name} — Studio SP_ACE`;
  // project.description (src/data/projects.js) runs 200+ characters --
  // real, client-approved copy, but too long for a search-result snippet
  // (~155-160 char budget) and would get truncated mid-sentence. Using
  // just its first sentence keeps this genuinely per-project (every
  // project's opening sentence names its own style/location) while
  // staying under budget; verified all 7 land at 124-157 chars.
  const firstSentence = project.description.split(". ")[0].replace(/\.$/, "");
  const description = `${project.name} — ${firstSentence}.`;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function ProjectDetailPage({ params }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const nextProject = getNextProject(slug);

  return (
    <>
      <Nav />
      <ProjectDetail project={project} nextProject={nextProject} />
      <Footer />
    </>
  );
}

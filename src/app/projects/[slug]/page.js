import { notFound } from "next/navigation";
import Nav from "@/components/home/Nav";
import Footer from "@/components/home/Footer";
import ProjectDetail from "@/components/projects/ProjectDetail";
import { PROJECTS } from "@/data/projects";
import { getProjectBySlug, getNextProject } from "@/lib/projects";
import { toShareImage } from "@/lib/site";

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  const title = `${project.name} | Studio SP_ACE`;
  const description = project.description;
  const image = toShareImage(project.cover);
  const isCloudinary = image?.includes("res.cloudinary.com");
  const images = image
    ? [isCloudinary ? { url: image, width: 1200, height: 630, alt: project.name } : { url: image, alt: project.name }]
    : undefined;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "Studio SP_ACE",
      type: "article",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
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

import ProjectHero from "./ProjectHero";
import ProjectGallery from "./ProjectGallery";
import ProjectVideo from "./ProjectVideo";
import NextProjectLink from "./NextProjectLink";

export default function ProjectDetail({ project, nextProject }) {
  return (
    <>
      <ProjectHero project={project} />
      <ProjectGallery name={project.name} rows={project.galleryRows} />
      {project.video && <ProjectVideo video={project.video} />}
      {nextProject && <NextProjectLink project={nextProject} />}
    </>
  );
}

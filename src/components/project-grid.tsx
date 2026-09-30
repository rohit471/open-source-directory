import { ProjectCard, ProjectCardData } from "./project-card";

interface ProjectGridProps {
  projects: ProjectCardData[];
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
}

export function ProjectGrid({
  projects,
  title,
  subtitle,
  emptyMessage = "No matching open source projects found.",
}: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 px-4 border border-dashed border-border rounded-2xl bg-card/40 my-4">
        <h3 className="text-base font-semibold text-foreground mb-1">{emptyMessage}</h3>
        <p className="text-xs text-muted-foreground">
          Try clearing your search query or exploring alternative categories.
        </p>
      </div>
    );
  }

  return (
    <section className="py-6">
      {title && (
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs sm:text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}

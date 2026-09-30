import Link from "next/link";
import { Star, ShieldCheck, Sparkles } from "lucide-react";
import { formatStarCount } from "@/lib/utils";
import { LogoImage } from "./logo-image";

export interface ProjectCardData {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  githubUrl: string;
  githubStars: number;
  license: string;
  logoUrl?: string | null;
  featured: boolean;
  category: {
    name: string;
    slug: string;
  };
  alternativeTo?: {
    name: string;
    slug: string;
  } | null;
}

export function ProjectCard({ project }: { project: ProjectCardData }) {
  return (
    <article className="group flex flex-col justify-between p-5 rounded-xl border border-[#DCE4DD] bg-white transition-all duration-200 hover:border-[#166534]/50 hover:shadow-sm">
      <div>
        {/* Top Header Row: Logo, Title, Badges, Stars */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Logo */}
            <LogoImage
              src={project.logoUrl}
              alt={project.title}
              sizeClassName="w-11 h-11 text-base shrink-0"
            />

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  href={`/project/${project.slug}`}
                  className="font-bold text-[#17221B] hover:text-[#166534] transition-colors text-base sm:text-[17px] tracking-tight truncate block"
                >
                  {project.title}
                </Link>

                {/* Editorial Selection vs Sponsorship Badges */}
                {project.featured && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#EAF4EC] text-[#166534] border border-[#DCE4DD] shrink-0">
                    <Sparkles className="w-2.5 h-2.5 text-[#166534]" />
                    Editor's Choice
                  </span>
                )}
              </div>

              <span className="text-xs text-[#59645D] font-medium block truncate mt-0.5">
                {project.category.name}
              </span>
            </div>
          </div>

          {/* GitHub Star Count */}
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`${project.title} on GitHub: ${project.githubStars} stars`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#DCE4DD] bg-[#F7F8F5] text-xs font-semibold text-[#17221B] hover:bg-[#EAF4EC] hover:border-[#166534]/40 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#166534] shadow-2xs"
          >
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{formatStarCount(project.githubStars)}</span>
          </a>
        </div>

        {/* Tagline / Value Proposition Body (14px) */}
        <p className="text-xs sm:text-sm text-[#59645D] line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
          {project.tagline}
        </p>
      </div>

      {/* Signature Alternative-To Badge & Metadata Footer */}
      <div className="pt-3 border-t border-[#DCE4DD] flex items-center justify-between gap-2 text-xs">
        {/* Signature Alternative To Badge */}
        {project.alternativeTo ? (
          <Link
            href={`/alternative-to/${project.alternativeTo.slug}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#EAF4EC] text-[#166534] font-semibold text-[11px] hover:bg-[#166534] hover:text-white transition-colors border border-[#DCE4DD] truncate max-w-[200px]"
            title={`Alternative to ${project.alternativeTo.name}`}
          >
            <span className="text-[#59645D] group-hover:text-white/80 font-normal">Replaces</span>
            <span className="font-semibold">{project.alternativeTo.name}</span>
          </Link>
        ) : (
          <span className="text-[11px] text-[#59645D] font-medium">Standalone Open Source</span>
        )}

        {/* License Pill */}
        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#17221B] shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-[#166534] shrink-0" />
          {project.license}
        </span>
      </div>
    </article>
  );
}




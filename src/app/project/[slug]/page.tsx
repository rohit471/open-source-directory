import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  ExternalLink,
  ShieldCheck,
  Github,
  Sparkles,
  HardDrive,
  Bot,
  Layers,
  Tag,
} from "lucide-react";
import { formatStarCount } from "@/lib/utils";
import { LogoImage } from "@/components/logo-image";
import type { Metadata } from "next";

interface ProjectDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 0;

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await prisma.project.findUnique({
    where: { slug },
    include: { alternativeTo: true },
  });

  if (!project) return { title: "Project Not Found" };

  const altTitle = project.alternativeTo ? ` (Alternative to ${project.alternativeTo.name})` : "";
  return {
    title: `${project.title}${altTitle} | OpenSource Market`,
    description: project.tagline,
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;

  // Fetch Project details
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      category: true,
      alternativeTo: true,
      stacks: true,
      tags: true,
    },
  });

  if (!project) {
    notFound();
  }

  // Fetch related projects in same category
  const relatedProjects = await prisma.project.findMany({
    where: {
      categoryId: project.categoryId,
      id: { not: project.id },
      status: "APPROVED",
    },
    take: 3,
    include: {
      category: true,
      alternativeTo: true,
    },
  });

  return (
    <div className="container-custom py-8">
      {/* Back button with preserved search context */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#59645D] hover:text-[#17221B] mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Directory</span>
      </Link>

      {/* 2-Column Grid (Main 672px + Sidebar 320px) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Main Column */}
        <div className="space-y-6 min-w-0">
          {/* Main Hero Card */}
          <div className="rounded-xl border border-[#DCE4DD] bg-white p-6 sm:p-7 shadow-2xs">
            <div className="flex items-start gap-4 mb-4">
              <LogoImage
                src={project.logoUrl}
                alt={project.title}
                sizeClassName="w-14 h-14 text-2xl shrink-0"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#17221B] break-words">
                    {project.title}
                  </h1>
                  {project.featured && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-[#EAF4EC] text-[#166534] border border-[#DCE4DD]">
                      <Sparkles className="w-3 h-3 text-[#166534]" /> Editor's Choice
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-[#59645D] mt-1">
                  {project.category.name}
                </p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#17221B] font-medium mb-6 leading-relaxed">
              {project.tagline}
            </p>

            {/* Signature Replaces Badge Banner */}
            {project.alternativeTo && (
              <div className="mb-6 p-3 rounded-lg bg-[#EAF4EC] border border-[#DCE4DD] flex items-center justify-between text-xs">
                <span className="text-[#59645D]">Open-source alternative to:</span>
                <Link
                  href={`/alternative-to/${project.alternativeTo.slug}`}
                  className="font-bold text-[#166534] hover:underline"
                >
                  {project.alternativeTo.name} →
                </Link>
              </div>
            )}

            {/* CTA Buttons Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-[#DCE4DD]">
              <a
                href={project.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#166534] hover:bg-[#11522a] text-white font-semibold text-xs sm:text-sm transition-all shadow-2xs active:scale-95"
              >
                <span>Visit Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`View ${project.title} on GitHub`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#DCE4DD] bg-[#F7F8F5] font-semibold text-xs sm:text-sm text-[#17221B] hover:bg-[#EAF4EC] transition-all shadow-2xs active:scale-95"
              >
                <Github className="w-3.5 h-3.5 text-[#17221B]" />
                <span>GitHub ({formatStarCount(project.githubStars)})</span>
              </a>
            </div>
          </div>

          {/* About Section */}
          <div className="rounded-xl border border-[#DCE4DD] bg-white p-6 shadow-2xs">
            <h2 className="text-base sm:text-lg font-bold text-[#17221B] mb-3">
              About {project.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#59645D] leading-relaxed whitespace-pre-line break-words">
              {project.description}
            </p>
          </div>

          {/* Related Projects */}
          {relatedProjects.length > 0 && (
            <div className="pt-2">
              <h3 className="text-base sm:text-lg font-bold text-[#17221B] mb-4">
                Similar {project.category.name} Alternatives
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {relatedProjects.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/project/${rel.slug}`}
                    className="p-4 rounded-lg border border-[#DCE4DD] bg-white hover:border-[#166534]/50 transition-all block"
                  >
                    <div className="font-bold text-[#17221B] text-xs truncate mb-1">
                      {rel.title}
                    </div>
                    <p className="text-[11px] text-[#59645D] line-clamp-2 leading-tight">
                      {rel.tagline}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Facts & Decision Sidebar (~320px on desktop) */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[#DCE4DD] bg-white p-5 space-y-4 shadow-2xs text-xs">
            <h3 className="font-bold text-[#17221B] text-sm border-b border-[#DCE4DD] pb-2">
              Project Decision Facts
            </h3>

            {/* Category */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#59645D] font-medium">Category</span>
              <Link
                href={`/category/${project.category.slug}`}
                className="font-semibold text-[#17221B] hover:text-[#166534]"
              >
                {project.category.name}
              </Link>
            </div>

            {/* Alternative To */}
            {project.alternativeTo && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#59645D] font-medium">Alternative to</span>
                <Link
                  href={`/alternative-to/${project.alternativeTo.slug}`}
                  className="font-semibold text-[#166534] hover:underline"
                >
                  {project.alternativeTo.name}
                </Link>
              </div>
            )}

            {/* GitHub Stars */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#59645D] font-medium">GitHub Stars</span>
              <span className="inline-flex items-center gap-1 font-semibold text-[#17221B]">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {project.githubStars.toLocaleString()}
              </span>
            </div>

            {/* License */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#59645D] font-medium">License</span>
              <span className="inline-flex items-center gap-1 font-mono font-semibold text-[#17221B]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#166534]" />
                {project.license}
              </span>
            </div>

            {/* Badges */}
            <div className="pt-2 border-t border-[#DCE4DD] flex flex-wrap gap-2">
              {project.isSelfHosted && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#EAF4EC] text-[#166534] font-semibold text-[11px] border border-[#DCE4DD]">
                  <HardDrive className="w-3 h-3 text-[#166534]" />
                  Self-Hosted
                </span>
              )}
              {project.isAiNative && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#EAF4EC] text-[#166534] font-semibold text-[11px] border border-[#DCE4DD]">
                  <Bot className="w-3 h-3 text-[#166534]" />
                  AI-Native
                </span>
              )}
            </div>

            {/* Tech Stacks */}
            {project.stacks && project.stacks.length > 0 && (
              <div className="pt-3 border-t border-[#DCE4DD]">
                <span className="text-[#59645D] font-medium block mb-2 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#166534]" /> Tech Stack
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {project.stacks.map((stack) => (
                    <span
                      key={stack.id}
                      className="px-2 py-0.5 rounded bg-[#F7F8F5] text-[#17221B] font-medium text-[11px] border border-[#DCE4DD]"
                    >
                      {stack.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Topic Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="pt-3 border-t border-[#DCE4DD]">
                <span className="text-[#59645D] font-medium block mb-2 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#166534]" /> Tags
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {project.tags.map((t) => (
                    <span
                      key={t.id}
                      className="px-2 py-0.5 rounded bg-[#F7F8F5] text-[#59645D] text-[11px] border border-[#DCE4DD]"
                    >
                      #{t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



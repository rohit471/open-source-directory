import { prisma } from "@/lib/prisma";
import { ProjectGrid } from "@/components/project-grid";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, ShieldCheck, PlusCircle } from "lucide-react";
import type { Metadata } from "next";

interface AlternativeToPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 0;

export async function generateMetadata({ params }: AlternativeToPageProps): Promise<Metadata> {
  const { slug } = await params;
  const alt = await prisma.alternativeTo.findUnique({ where: { slug } });
  if (!alt) return { title: "Alternative Target Not Found" };
  return {
    title: `Best Open Source Alternatives to ${alt.name} | OpenSource Market`,
    description: `Discover free, self-hostable open source software alternatives to ${alt.name}.`,
  };
}

export default async function AlternativeToPage({ params }: AlternativeToPageProps) {
  const { slug } = await params;

  // Fetch Alternative Target
  const alternativeTarget = await prisma.alternativeTo.findUnique({
    where: { slug },
  });

  if (!alternativeTarget) {
    notFound();
  }

  // Fetch Projects matching this alternative target
  const projects = await prisma.project.findMany({
    where: {
      alternativeToId: alternativeTarget.id,
      status: "APPROVED",
    },
    include: {
      category: { select: { name: true, slug: true } },
      alternativeTo: { select: { name: true, slug: true } },
    },
    orderBy: { githubStars: "desc" },
  });

  return (
    <div className="container-custom py-8 min-w-0">
      {/* Back button */}
      <Link
        href="/alternatives"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#59645D] hover:text-[#17221B] mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>All SaaS Alternatives</span>
      </Link>

      {/* Target Banner */}
      <div className="rounded-xl border border-[#DCE4DD] bg-white p-6 sm:p-7 mb-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF4EC] text-[#166534] text-xs font-semibold mb-3 border border-[#DCE4DD]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#166534]" />
              <span>Alternatives to {alternativeTarget.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#17221B]">
              Open-Source Alternatives to {alternativeTarget.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#59645D] mt-2 max-w-2xl leading-relaxed">
              Discover community-maintained, privacy-first open-source software alternatives to {alternativeTarget.name}. Retain control over your data and infrastructure.
            </p>
          </div>

          {alternativeTarget.website && (
            <a
              href={alternativeTarget.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg border border-[#DCE4DD] bg-[#F7F8F5] text-xs font-semibold text-[#59645D] hover:text-[#17221B] hover:bg-[#EAF4EC] transition-colors shrink-0 self-start sm:self-center"
            >
              <span>{alternativeTarget.name} Proprietary Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Grid or Contextual Empty State */}
      {projects.length > 0 ? (
        <ProjectGrid
          projects={projects}
        />
      ) : (
        <div className="text-center py-16 px-6 border border-dashed border-[#DCE4DD] rounded-xl bg-white my-6">
          <h2 className="text-lg font-bold text-[#17221B] mb-2">
            No open source replacements listed for {alternativeTarget.name} yet
          </h2>
          <p className="text-xs sm:text-sm text-[#59645D] max-w-md mx-auto mb-6 leading-relaxed">
            Are you building or using an open-source alternative to {alternativeTarget.name}? Submit it to be indexed in the directory!
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#166534] text-white text-xs font-semibold hover:bg-[#11522a] transition-all shadow-2xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit {alternativeTarget.name} Alternative</span>
            </Link>
            <Link
              href="/alternatives"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#DCE4DD] bg-white text-xs font-semibold text-[#17221B] hover:bg-[#EAF4EC] transition-all"
            >
              <span>Explore Other SaaS Targets</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

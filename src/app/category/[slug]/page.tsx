import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/hero";
import { ProjectGrid } from "@/components/project-grid";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import type { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 0;

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return { title: "Category Not Found" };
  return {
    title: `${category.name} Open Source Software | OpenSource Market`,
    description: category.description || `Browse open source ${category.name} tools and software.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  // Fetch Category
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    notFound();
  }

  // Fetch Category Projects
  const projects = await prisma.project.findMany({
    where: {
      categoryId: category.id,
      status: "APPROVED",
    },
    include: {
      category: { select: { name: true, slug: true } },
      alternativeTo: { select: { name: true, slug: true } },
    },
    orderBy: [
      { featured: "desc" },
      { githubStars: "desc" },
    ],
  });

  return (
    <div className="container-custom py-8">
      {/* Category Header Header */}
      <div className="mb-8 border-b border-[#DCE4DD] pb-6">
        <div className="flex items-center gap-2 text-xs text-[#59645D] mb-3">
          <Link href="/" className="hover:text-[#17221B] transition-colors">
            Directory
          </Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-[#17221B] transition-colors">
            Categories
          </Link>
          <span>/</span>
          <span className="text-[#17221B] font-semibold">{category.name}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#17221B]">
              {category.name} Open-Source Tools
            </h1>
            <p className="text-xs sm:text-sm text-[#59645D] mt-1 max-w-2xl leading-relaxed">
              {category.description || `Browse community-maintained open source ${category.name} software.`}
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF4EC] text-[#166534] font-semibold border border-[#DCE4DD] text-xs self-start md:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-[#166534]" />
            {projects.length} {projects.length === 1 ? "tool verified" : "tools verified"}
          </span>
        </div>
      </div>

      {projects.length > 0 ? (
        <ProjectGrid projects={projects} />
      ) : (
        <div className="text-center py-16 px-6 border border-dashed border-[#DCE4DD] rounded-2xl bg-white my-6">
          <h2 className="text-lg font-bold text-[#17221B] mb-2">
            No open source tools listed in {category.name} yet
          </h2>
          <p className="text-xs sm:text-sm text-[#59645D] max-w-md mx-auto mb-6 leading-relaxed">
            Have an open source tool in this domain? Submit it for editorial review!
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#166534] text-white text-xs font-semibold hover:bg-[#11522a] transition-all shadow-2xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Software for {category.name}</span>
          </Link>
        </div>
      )}
    </div>
  );
}

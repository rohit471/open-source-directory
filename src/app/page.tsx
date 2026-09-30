import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/hero";
import { DirectoryToolbar } from "@/components/directory-toolbar";
import { ProjectGrid } from "@/components/project-grid";

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    sort?: string;
  }>;
}

export const revalidate = 0;

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;
  const searchQuery = (resolvedParams.q || "").trim();
  const sortQuery = (resolvedParams.sort || "stars").trim();

  // Fetch Categories
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  // Determine order by strategy: "stars" MUST be globally descending by githubStars
  let orderByCondition: any = [{ githubStars: "desc" }];
  if (sortQuery === "name") {
    orderByCondition = [{ title: "asc" }];
  } else if (sortQuery === "featured") {
    orderByCondition = [{ featured: "desc" }, { githubStars: "desc" }];
  }

  // Fetch Projects filtered by search query if present
  const projects = await prisma.project.findMany({
    where: {
      status: "APPROVED",
      ...(searchQuery
        ? {
            OR: [
              { title: { contains: searchQuery } },
              { tagline: { contains: searchQuery } },
              { description: { contains: searchQuery } },
              { category: { name: { contains: searchQuery } } },
              { alternativeTo: { name: { contains: searchQuery } } },
            ],
          }
        : {}),
    },
    include: {
      category: { select: { name: true, slug: true } },
      alternativeTo: { select: { name: true, slug: true } },
    },
    orderBy: orderByCondition,
  });

  return (
    <div>
      {/* Hero Section */}
      <Hero categories={categories} activeCategory="all" />

      {/* Main Content Constrained to 1024px Container */}
      <div className="container-custom py-8">
        {/* Directory Toolbar with Search, Sort, and Count */}
        <DirectoryToolbar totalCount={projects.length} />

        {/* Directory Card Grid */}
        <ProjectGrid
          projects={projects}
          emptyMessage={
            searchQuery
              ? `No open source tools matched "${searchQuery}".`
              : "No open source tools found."
          }
        />
      </div>
    </div>
  );
}


import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Code2, Database, LineChart, Workflow, Palette, Bot, ArrowRight } from "lucide-react";

export const revalidate = 0;

const ICON_MAP: Record<string, any> = {
  "developer-tools": Code2,
  "database-backend": Database,
  "analytics-data": LineChart,
  "productivity-workflow": Workflow,
  "design-media": Palette,
  "ai-ml": Bot,
};

export default async function CategoriesOverviewPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { projects: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container-custom py-10">
      <div className="max-w-2xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF4EC] text-[#166534] border border-[#DCE4DD] mb-3">
          <span>Explore Domains</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#17221B]">
          Browse Open-Source Categories
        </h1>
        <p className="text-sm text-[#59645D] mt-2 leading-relaxed">
          Discover verified software alternatives organized by engineering domain and workflow needs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const CategoryIcon = ICON_MAP[cat.slug] || Code2;
          return (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group p-5 rounded-xl border border-[#DCE4DD] bg-white hover:border-[#166534]/50 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-[#EAF4EC] text-[#166534] flex items-center justify-center font-bold text-sm shrink-0 border border-[#DCE4DD]">
                    <CategoryIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EAF4EC] text-[#166534] border border-[#DCE4DD] shrink-0">
                    {cat._count.projects} {cat._count.projects === 1 ? "tool" : "tools"}
                  </span>
                </div>
                <h2 className="font-bold text-[#17221B] text-base group-hover:text-[#166534] transition-colors mb-1">
                  {cat.name}
                </h2>
                <p className="text-xs text-[#59645D] line-clamp-2 leading-relaxed">
                  {cat.description || `Verified open source ${cat.name} tools.`}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-[#DCE4DD] flex items-center text-xs font-semibold text-[#166534] group-hover:underline">
                <span>View {cat.name}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}


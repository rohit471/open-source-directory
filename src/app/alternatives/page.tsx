import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";

export const revalidate = 0;

export default async function AlternativesOverviewPage() {
  const alternatives = await prisma.alternativeTo.findMany({
    include: {
      _count: {
        select: { projects: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container-custom py-10">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF4EC] text-[#166534] text-xs font-semibold mb-3 border border-[#DCE4DD]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#166534]" />
          <span>SaaS Index</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#17221B]">
          Proprietary SaaS Alternatives
        </h1>
        <p className="text-sm text-[#59645D] mt-2 leading-relaxed">
          Discover verified self-hostable open-source equivalents to proprietary cloud subscriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {alternatives.map((alt) => (
          <Link
            key={alt.id}
            href={`/alternative-to/${alt.slug}`}
            className="group p-5 rounded-xl border border-[#DCE4DD] bg-white hover:border-[#166534]/50 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-[#59645D]">Replaces</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EAF4EC] text-[#166534] border border-[#DCE4DD]">
                  {alt._count.projects} {alt._count.projects === 1 ? "Replacement" : "Replacements"}
                </span>
              </div>
              <h3 className="font-bold text-[#17221B] text-xl group-hover:text-[#166534] transition-colors">
                {alt.name}
              </h3>
            </div>

            <div className="pt-4 mt-6 border-t border-[#DCE4DD] flex items-center justify-between text-xs font-semibold text-[#166534] group-hover:underline">
              <span>View Alternatives to {alt.name}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

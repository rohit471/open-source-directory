import { prisma } from "@/lib/prisma";
import { SubmitForm } from "./submit-form";

export const revalidate = 0;

export default async function SubmitPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="container-custom max-w-3xl py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF4EC] text-[#166534] border border-[#DCE4DD] mb-3">
          <span>Editorial Indexing</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#17221B]">
          Submit an Open-Source Project
        </h1>
        <p className="text-sm text-[#59645D] mt-2 max-w-lg mx-auto leading-relaxed">
          Submit your open-source software, developer tool, or SaaS alternative for directory evaluation.
        </p>
      </div>

      <SubmitForm categories={categories} />
    </div>
  );
}

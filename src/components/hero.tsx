"use client";

import { Sparkles } from "lucide-react";

interface HeroProps {
  categories?: { id: string; name: string; slug: string }[];
  activeCategory?: string;
  isCompact?: boolean;
}

export function Hero({ isCompact = false }: HeroProps) {
  if (isCompact) {
    return (
      <section className="py-6 bg-[#F7F8F5] border-b border-[#DCE4DD]">
        <div className="container-custom">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#17221B]">
            Open Source Directory
          </h1>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-10 pb-8 sm:pt-14 sm:pb-10 bg-[#F7F8F5] border-b border-[#DCE4DD]">
      <div className="container-custom">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Micro Eyebrow Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF4EC] text-[#166534] border border-[#DCE4DD] mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#166534]" />
            <span>Curated Open-Source Guide</span>
          </div>

          {/* Premium Editorial Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#17221B] leading-[1.12] mb-3">
            Find open-source alternatives{" "}
            <span className="text-[#166534] font-extrabold">to proprietary SaaS.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#59645D] max-w-2xl leading-relaxed font-normal">
            Independent evaluations of community-maintained software, transparent codebases, and self-hosted privacy tools.
          </p>
        </div>
      </div>
    </section>
  );
}






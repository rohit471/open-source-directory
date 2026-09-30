"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, CheckCircle2, Loader2, PlusCircle } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

export function SubmitForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [githubImportUrl, setGithubImportUrl] = useState("");
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: "",
    tagline: "",
    description: "",
    websiteUrl: "",
    githubUrl: "",
    license: "",
    customLicense: "",
    categoryId: "",
    alternativeToName: "",
  });

  const handleGitHubAutoFill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubImportUrl.trim()) return;

    setImporting(true);
    setImportStatus(null);

    try {
      const res = await fetch("/api/import-github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: githubImportUrl }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.data) {
        const d = data.data;
        setFormData((prev) => ({
          ...prev,
          title: d.title || prev.title,
          tagline: d.tagline || prev.tagline,
          description: d.description || prev.description,
          websiteUrl: d.websiteUrl || prev.websiteUrl,
          githubUrl: d.githubUrl || prev.githubUrl,
          license: ["MIT", "Apache-2.0", "AGPL-3.0", "MPL-2.0"].includes(d.license) ? d.license : "OTHER",
          customLicense: ["MIT", "Apache-2.0", "AGPL-3.0", "MPL-2.0"].includes(d.license) ? "" : d.license,
          categoryId: d.categoryId || prev.categoryId,
          alternativeToName: d.alternativeToName || prev.alternativeToName,
        }));
        setImportStatus({
          type: "success",
          message: `⚡ Auto-filled fields from ${d.title}! Review details below and click Submit.`,
        });
      } else {
        setImportStatus({
          type: "error",
          message: data.error || "Could not fetch GitHub repository details.",
        });
      }
    } catch (err: any) {
      setImportStatus({
        type: "error",
        message: err.message || "Failed to connect to GitHub API.",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, isFeatured }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        setSuccessMessage(data.message || "Project submitted successfully!");
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 2000);
      } else {
        if (data.details) {
          setFieldErrors(data.details);
        } else {
          alert(data.error || "Failed to submit project.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred while submitting.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-10 text-center animate-in fade-in zoom-in-95 duration-300">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Submission Received!</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{successMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1-Click GitHub Auto-Fill Card */}
      <div className="rounded-xl border border-[#166534]/30 bg-[#EAF4EC] p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-[#166534]" />
          <h3 className="font-bold text-[#17221B] text-sm">
            1-Click GitHub Auto-Fill
          </h3>
          <span className="text-[10px] font-semibold bg-[#166534] text-white px-2 py-0.5 rounded-full ml-auto">
            Fastest Option
          </span>
        </div>
        <p className="text-xs text-[#59645D] mb-3 leading-relaxed">
          Paste any open-source GitHub repository URL to auto-fill project details, stars, license, logo, and tech stack in 1 second!
        </p>

        <form onSubmit={handleGitHubAutoFill} className="flex flex-col sm:flex-row items-stretch gap-2">
          <input
            type="text"
            value={githubImportUrl}
            onChange={(e) => setGithubImportUrl(e.target.value)}
            placeholder="e.g., https://github.com/appwrite/appwrite"
            className="flex-1 px-3.5 py-2 rounded-lg border border-[#DCE4DD] bg-white text-[#17221B] text-xs focus:outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20"
          />
          <button
            type="submit"
            disabled={importing || !githubImportUrl.trim()}
            className="px-4 py-2 rounded-lg bg-[#166534] hover:bg-[#11522a] text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50 cursor-pointer shrink-0"
          >
            {importing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Fetching Repo...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Fill Form</span>
              </>
            )}
          </button>
        </form>

        {importStatus && (
          <div
            className={`mt-3 p-2.5 rounded-md text-xs font-medium border ${
              importStatus.type === "success"
                ? "bg-white text-[#166534] border-[#166534]/40"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {importStatus.message}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
      {/* Listing Plan Type Selector - Accessible Radio Group */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-bold text-[#17221B] mb-2">Select Submission Option *</legend>
        <div
          role="radiogroup"
          aria-label="Submission listing plan option"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {/* Free Editorial Option */}
          <div
            role="radio"
            aria-checked={!isFeatured}
            tabIndex={0}
            onClick={() => setIsFeatured(false)}
            onKeyDown={(e) => {
              if (
                e.key === " " ||
                e.key === "Enter" ||
                e.key === "ArrowLeft" ||
                e.key === "ArrowRight" ||
                e.key === "ArrowUp" ||
                e.key === "ArrowDown"
              ) {
                e.preventDefault();
                setIsFeatured(false);
              }
            }}
            className={`cursor-pointer p-5 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#166534] min-h-[100px] ${
              !isFeatured
                ? "border-[#166534] bg-[#EAF4EC] ring-1 ring-[#166534]"
                : "border-[#DCE4DD] bg-white text-[#59645D] hover:border-[#166534]/40"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-[#17221B] text-sm">Standard Editorial Listing</span>
              <span className="text-[10px] font-semibold bg-white text-[#166534] border border-[#DCE4DD] px-2 py-0.5 rounded-full">
                Free Curation
              </span>
            </div>
            <div className="text-xs text-[#59645D]">
              Submitted to moderation queue. Evaluated and indexed upon editorial approval.
            </div>
            <div className="mt-3 text-sm font-bold text-[#166534]">$0 Free</div>
          </div>

          {/* Paid Sponsorship Option */}
          <div
            role="radio"
            aria-checked={isFeatured}
            tabIndex={0}
            onClick={() => setIsFeatured(true)}
            onKeyDown={(e) => {
              if (
                e.key === " " ||
                e.key === "Enter" ||
                e.key === "ArrowLeft" ||
                e.key === "ArrowRight" ||
                e.key === "ArrowUp" ||
                e.key === "ArrowDown"
              ) {
                e.preventDefault();
                setIsFeatured(true);
              }
            }}
            className={`cursor-pointer p-5 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#92400E] relative overflow-hidden min-h-[100px] ${
              isFeatured
                ? "border-[#92400E] bg-[#FFF4DE] ring-1 ring-[#92400E]"
                : "border-[#DCE4DD] bg-white text-[#59645D] hover:border-[#92400E]/40"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-[#17221B] text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#92400E]" /> Sponsored Placement
              </span>
              <span className="text-[10px] font-semibold bg-[#92400E] text-white px-2 py-0.5 rounded-full">
                Paid Sponsorship
              </span>
            </div>
            <div className="text-xs text-[#59645D]">
              Promoted placement + distinct Sponsored badge on homepage and category index.
            </div>
            <div className="mt-3 text-sm font-bold text-[#92400E]">
              $49 <span className="text-xs font-normal text-[#59645D]">one-time placement fee</span>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Form Fields */}
      <div className="rounded-xl border border-[#DCE4DD] bg-white p-6 sm:p-8 space-y-5 shadow-2xs">
        <div>
          <label htmlFor="submit-title" className="block text-xs font-semibold text-[#17221B] mb-1.5">
            Project Title *
          </label>
          <input
            id="submit-title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Supabase, PostHog, Cal.com"
            className="w-full px-4 py-2.5 rounded-lg border border-[#DCE4DD] bg-white text-[#17221B] text-sm focus:outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20"
          />
          {fieldErrors.title && <p className="text-xs text-red-600 mt-1">{fieldErrors.title}</p>}
        </div>

        <div>
          <label htmlFor="submit-tagline" className="block text-xs font-semibold text-[#17221B] mb-1.5">
            Tagline (One-sentence summary) *
          </label>
          <input
            id="submit-tagline"
            type="text"
            required
            value={formData.tagline}
            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            placeholder="e.g., The open source Firebase alternative with Postgres & Auth"
            className="w-full px-4 py-2.5 rounded-lg border border-[#DCE4DD] bg-white text-[#17221B] text-sm focus:outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20"
          />
          {fieldErrors.tagline && <p className="text-xs text-red-600 mt-1">{fieldErrors.tagline}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="submit-website" className="block text-xs font-semibold text-[#17221B] mb-1.5">
              Website URL *
            </label>
            <input
              id="submit-website"
              type="url"
              required
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              placeholder="https://yourproject.com"
              className="w-full px-4 py-2.5 rounded-lg border border-[#DCE4DD] bg-white text-[#17221B] text-sm focus:outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20"
            />
            {fieldErrors.websiteUrl && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.websiteUrl}</p>
            )}
          </div>

          <div>
            <label htmlFor="submit-github" className="block text-xs font-semibold text-[#17221B] mb-1.5">
              GitHub Repository URL *
            </label>
            <input
              id="submit-github"
              type="url"
              required
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              placeholder="https://github.com/org/repo"
              className="w-full px-4 py-2.5 rounded-lg border border-[#DCE4DD] bg-white text-[#17221B] text-sm focus:outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20"
            />
            {fieldErrors.githubUrl && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.githubUrl}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="submit-category" className="block text-xs font-semibold text-[#17221B] mb-1.5">
              Category *
            </label>
            <select
              id="submit-category"
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-[#DCE4DD] bg-white text-[#17221B] text-sm focus:outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20"
            >
              <option value="" disabled>
                -- Select Category --
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {fieldErrors.categoryId && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.categoryId}</p>
            )}
          </div>

          <div>
            <label htmlFor="submit-license" className="block text-xs font-semibold text-[#17221B] mb-1.5">
              Open Source License *
            </label>
            <select
              id="submit-license"
              required
              value={formData.license}
              onChange={(e) => setFormData({ ...formData, license: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-[#DCE4DD] bg-white text-[#17221B] text-sm focus:outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20"
            >
              <option value="" disabled>
                -- Select License --
              </option>
              <option value="MIT">MIT License</option>
              <option value="Apache-2.0">Apache 2.0</option>
              <option value="AGPL-3.0">AGPL v3.0</option>
              <option value="MPL-2.0">Mozilla Public License 2.0</option>
              <option value="OTHER">Other / Custom</option>
            </select>
            {formData.license === "OTHER" && (
              <input
                type="text"
                value={formData.customLicense}
                onChange={(e) => setFormData({ ...formData, customLicense: e.target.value })}
                placeholder="Specify license name..."
                className="w-full mt-2 px-3 py-2 rounded-lg border border-[#DCE4DD] bg-white text-xs"
              />
            )}
            {fieldErrors.license && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.license}</p>
            )}
          </div>

          <div>
            <label htmlFor="submit-alternative" className="block text-xs font-semibold text-[#17221B] mb-1.5">
              Alternative to SaaS (Optional)
            </label>
            <input
              id="submit-alternative"
              type="text"
              value={formData.alternativeToName}
              onChange={(e) => setFormData({ ...formData, alternativeToName: e.target.value })}
              placeholder="e.g., Firebase, Mixpanel, Figma"
              className="w-full px-4 py-2.5 rounded-lg border border-[#DCE4DD] bg-white text-[#17221B] text-sm focus:outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20"
            />
          </div>
        </div>

        <div>
          <label htmlFor="submit-description" className="block text-xs font-semibold text-[#17221B] mb-1.5">
            Detailed Overview & Features
          </label>
          <textarea
            id="submit-description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Explain key capabilities, architecture decisions, and self-hosting options..."
            className="w-full px-4 py-2.5 rounded-lg border border-[#DCE4DD] bg-white text-[#17221B] text-sm focus:outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20"
          />
        </div>
      </div>

      <p className="text-xs text-[#59645D] text-center">
        {isFeatured
          ? "Selected Option: Paid Sponsorship ($49 one-time). Promoted placement will be activated upon approval."
          : "Selected Option: Standard Free Listing. Project will enter the community moderation queue."}
      </p>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-6 rounded-lg bg-[#166534] text-white font-semibold text-sm hover:bg-[#11522a] transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-98 disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Submitting Project...</span>
          </>
        ) : (
          <>
            <PlusCircle className="w-4 h-4" />
            <span>Submit {formData.title ? `"${formData.title}"` : "Software"}</span>
          </>
        )}
      </button>
    </form>
  </div>
);
}

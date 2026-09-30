"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FolderKanban,
  Star,
  Download,
  Search,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  Sparkles,
  ExternalLink,
  Github,
  Mail,
  RefreshCw,
  Layers,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import { LogoImage } from "@/components/logo-image";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface AlternativeTo {
  id: string;
  name: string;
  slug: string;
}

interface Project {
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
  status: string;
  category: Category;
  alternativeTo?: AlternativeTo | null;
  createdAt: string;
}

interface Stats {
  totalProjects: number;
  approvedProjects: number;
  pendingProjects: number;
  featuredProjects: number;
  totalStars: number;
  totalCategories: number;
  totalAlternatives: number;
  totalSubscribers: number;
}

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

interface AdminDashboardProps {
  initialStats: Stats;
  initialProjects: Project[];
  initialCategories: Category[];
  initialAlternatives: AlternativeTo[];
  initialSubscribers: Subscriber[];
}

export function AdminDashboard({
  initialStats,
  initialProjects,
  initialCategories,
  initialAlternatives,
  initialSubscribers,
}: AdminDashboardProps) {
  const [stats, setStats] = useState<Stats>(initialStats);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);

  const [activeTab, setActiveTab] = useState<"projects" | "pending" | "importer" | "subscribers">("projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Quick GitHub Importer state
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [isPending, startTransition] = useTransition();

  // Refresh data from API
  async function refreshData() {
    try {
      const res = await fetch("/api/admin/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);
        setStats(data.stats);
      }
      const subRes = await fetch("/api/admin/subscribers");
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscribers(subData.subscribers);
      }
    } catch (e) {
      console.error("Refresh error:", e);
    }
  }

  // Toggle Featured State
  async function toggleFeatured(project: Project) {
    const newFeatured = !project.featured;
    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, featured: newFeatured } : p))
    );

    try {
      const res = await fetch("/api/admin/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: project.id, featured: newFeatured }),
      });
      if (!res.ok) {
        // Revert on error
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, featured: project.featured } : p))
        );
      } else {
        refreshData();
      }
    } catch (e) {
      console.error("Failed to update featured flag:", e);
    }
  }

  // Update Status (APPROVED / REJECTED / PENDING)
  async function updateStatus(projectId: string, newStatus: string) {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p))
    );

    try {
      const res = await fetch("/api/admin/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: projectId, status: newStatus }),
      });
      if (!res.ok) {
        refreshData();
      } else {
        refreshData();
      }
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  }

  // Delete Project
  async function deleteProject(project: Project) {
    if (!confirm(`Are you sure you want to delete "${project.title}" from directory?`)) {
      return;
    }

    setProjects((prev) => prev.filter((p) => p.id !== project.id));

    try {
      const res = await fetch(`/api/admin/projects?id=${project.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        refreshData();
      } else {
        refreshData();
      }
    } catch (e) {
      console.error("Failed to delete project:", e);
    }
  }

  // Handle GitHub Importer
  async function handleImportSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!importUrl.trim()) return;

    setImporting(true);
    setImportMessage(null);

    try {
      const res = await fetch("/api/import-github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl.trim(), autoPublish: true }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setImportMessage({ type: "success", text: data.message || `Successfully imported "${data.project?.title}"!` });
        setImportUrl("");
        refreshData();
      } else {
        setImportMessage({ type: "error", text: data.error || "Failed to import GitHub repository." });
      }
    } catch (e: any) {
      setImportMessage({ type: "error", text: e.message || "An unexpected error occurred." });
    } finally {
      setImporting(false);
    }
  }

  // Filter projects logic
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.alternativeTo?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.githubUrl.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "ALL" || p.category.slug === categoryFilter;

    let matchesStatus = true;
    if (statusFilter === "APPROVED") matchesStatus = p.status === "APPROVED";
    if (statusFilter === "PENDING") matchesStatus = p.status === "PENDING";
    if (statusFilter === "FEATURED") matchesStatus = p.featured;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const pendingSubmissions = projects.filter((p) => p.status === "PENDING");

  // Export Subscribers to CSV
  function exportSubscribers() {
    if (subscribers.length === 0) return;
    const csvContent = "data:text/csv;charset=utf-8,Email,Joined Date\n" +
      subscribers.map((s) => `"${s.email}","${new Date(s.createdAt).toISOString()}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `opensource_subscribers_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Overview Bar */}
      <div className="bg-white rounded-xl border border-[#DCE4DD] p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#EAF4EC]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF4EC] text-[#166534]">
                <ShieldAlert className="w-3.5 h-3.5" />
                Admin Dashboard
              </span>
              <span className="text-xs text-[#59645D]">· Live Catalog Controls</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#17221B]">
              OpenSource Market Operations
            </h1>
            <p className="text-sm text-[#59645D] mt-0.5">
              Manage open-source tool entries, evaluate community submissions, and import GitHub repos.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => refreshData()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-[#DCE4DD] bg-white text-[#17221B] hover:bg-[#F7F8F5] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>

            <button
              onClick={async () => {
                await fetch("/api/admin/logout", { method: "POST" });
                window.location.href = "/admin/login";
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
            >
              Log Out
            </button>

            <Link
              href="/submit"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#166534] text-white hover:bg-[#11522a] transition-colors shadow-2xs"
            >
              <PlusCircle className="w-4 h-4" />
              Submit Page
            </Link>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-lg bg-[#F7F8F5] border border-[#EAF4EC]">
            <div className="flex items-center justify-between text-xs font-medium text-[#59645D] mb-1">
              <span>Total Tools</span>
              <FolderKanban className="w-4 h-4 text-[#166534]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#17221B]">
                {stats.totalProjects}
              </span>
              <span className="text-xs font-medium text-[#166534] bg-emerald-100/70 px-1.5 py-0.5 rounded">
                {stats.approvedProjects} Approved
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#F7F8F5] border border-[#EAF4EC]">
            <div className="flex items-center justify-between text-xs font-medium text-[#59645D] mb-1">
              <span>Combined Stars</span>
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#17221B]">
                {stats.totalStars > 1000
                  ? `${(stats.totalStars / 1000).toFixed(1)}k`
                  : stats.totalStars}
              </span>
              <span className="text-xs text-[#59645D]">Across catalog</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#F7F8F5] border border-[#EAF4EC]">
            <div className="flex items-center justify-between text-xs font-medium text-[#59645D] mb-1">
              <span>Categories & Alts</span>
              <Layers className="w-4 h-4 text-[#166534]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#17221B]">
                {stats.totalCategories}
              </span>
              <span className="text-xs text-[#59645D]">
                / {stats.totalAlternatives} SaaS targets
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#F7F8F5] border border-[#EAF4EC]">
            <div className="flex items-center justify-between text-xs font-medium text-[#59645D] mb-1">
              <span>Subscribers</span>
              <Mail className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#17221B]">
                {stats.totalSubscribers}
              </span>
              <span className="text-xs text-[#59645D]">Newsletter list</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick 1-Click GitHub Importer Card */}
      <div className="bg-[#166534] text-white rounded-xl p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              1-Click GitHub Auto-Fill & Publish
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Instant Repository Import
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1">
              Enter any GitHub URL to auto-extract title, tagline, star count, license, logo, and SaaS replacements straight into SQLite.
            </p>
          </div>

          <form
            onSubmit={handleImportSubmit}
            className="flex-1 max-w-md flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Github className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="https://github.com/owner/repository"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-lg text-xs sm:text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <button
              type="submit"
              disabled={importing}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold bg-[#17221B] text-white hover:bg-[#0f1712] disabled:opacity-50 transition-all shrink-0 active:scale-95 shadow-sm"
            >
              {importing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Auto-Publish</span>
                </>
              )}
            </button>
          </form>
        </div>

        {importMessage && (
          <div
            className={`mt-4 p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
              importMessage.type === "success"
                ? "bg-emerald-800/80 text-emerald-100 border border-emerald-600"
                : "bg-red-900/80 text-red-100 border border-red-700"
            }`}
          >
            {importMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-300" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0 text-red-300" />
            )}
            <span>{importMessage.text}</span>
          </div>
        )}
      </div>

      {/* Main Tabs Navigation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#DCE4DD] pb-px overflow-x-auto">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("projects")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "projects"
                  ? "border-[#166534] text-[#166534]"
                  : "border-transparent text-[#59645D] hover:text-[#17221B]"
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>All Projects ({projects.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("pending")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "pending"
                  ? "border-[#166534] text-[#166534]"
                  : "border-transparent text-[#59645D] hover:text-[#17221B]"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Pending Queue</span>
              {pendingSubmissions.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {pendingSubmissions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("subscribers")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "subscribers"
                  ? "border-[#166534] text-[#166534]"
                  : "border-transparent text-[#59645D] hover:text-[#17221B]"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Subscribers ({subscribers.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: All Projects Management Table */}
        {activeTab === "projects" && (
          <div className="bg-white rounded-xl border border-[#DCE4DD] overflow-hidden shadow-2xs">
            {/* Search & Filter Toolbar */}
            <div className="p-4 border-b border-[#EAF4EC] bg-[#F7F8F5] flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by title, tagline, SaaS..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#DCE4DD] bg-white focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-[#DCE4DD] bg-white font-medium text-[#17221B] focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  {initialCategories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-[#DCE4DD] bg-white font-medium text-[#17221B] focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PENDING">Pending</option>
                  <option value="FEATURED">Featured Only</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#EAF4EC] bg-[#F7F8F5] text-[#59645D] font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Tool & SaaS Target</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Stars</th>
                    <th className="py-3 px-4 text-center">Editor Badge</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAF4EC]">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#59645D]">
                        No projects found matching query.
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F7F8F5]/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <LogoImage
                              src={p.logoUrl}
                              alt={p.title}
                              sizeClassName="w-9 h-9 text-xs"
                              className="rounded-lg border border-[#EAF4EC] shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <Link
                                  href={`/project/${p.slug}`}
                                  target="_blank"
                                  className="font-bold text-[#17221B] hover:text-[#166534] transition-colors flex items-center gap-1 text-sm"
                                >
                                  {p.title}
                                  <ArrowUpRight className="w-3 h-3 text-gray-400" />
                                </Link>
                              </div>
                              <div className="text-[11px] text-[#59645D] line-clamp-1 max-w-sm">
                                {p.tagline}
                              </div>
                              {p.alternativeTo && (
                                <span className="inline-block mt-0.5 text-[10px] font-semibold text-[#166534] bg-[#EAF4EC] px-1.5 py-0.2 rounded">
                                  Replaces {p.alternativeTo.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-medium text-[#17221B]">
                          {p.category.name}
                        </td>

                        <td className="py-3 px-4 text-center font-bold text-[#17221B]">
                          ⭐ {p.githubStars.toLocaleString()}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => toggleFeatured(p)}
                            title="Toggle Featured Editor Choice badge"
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                              p.featured
                                ? "bg-emerald-100 text-[#166534] border border-emerald-300"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200"
                            }`}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                p.featured ? "fill-[#166534] text-[#166534]" : "text-gray-400"
                              }`}
                            />
                            {p.featured ? "Editor Choice" : "Standard"}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === "APPROVED"
                                ? "bg-emerald-100 text-[#166534]"
                                : p.status === "PENDING"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {p.status !== "APPROVED" && (
                              <button
                                onClick={() => updateStatus(p.id, "APPROVED")}
                                title="Approve Project"
                                className="p-1.5 rounded-md bg-emerald-50 text-[#166534] hover:bg-emerald-100 transition-colors"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}

                            {p.status !== "REJECTED" && (
                              <button
                                onClick={() => updateStatus(p.id, "REJECTED")}
                                title="Reject Project"
                                className="p-1.5 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => deleteProject(p)}
                              title="Delete Project"
                              className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Pending Submissions Queue */}
        {activeTab === "pending" && (
          <div className="bg-white rounded-xl border border-[#DCE4DD] p-6 shadow-2xs space-y-4">
            <div>
              <h3 className="text-lg font-bold text-[#17221B]">
                Pending Community Submissions ({pendingSubmissions.length})
              </h3>
              <p className="text-xs text-[#59645D]">
                Tools submitted via the website submission form awaiting admin review.
              </p>
            </div>

            {pendingSubmissions.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-[#DCE4DD] rounded-lg bg-[#F7F8F5]">
                <CheckCircle2 className="w-8 h-8 text-[#166534] mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#17221B]">
                  No pending submissions in queue!
                </p>
                <p className="text-xs text-[#59645D] mt-1">
                  All community submissions have been evaluated.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingSubmissions.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-lg border border-amber-200 bg-amber-50/40 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <LogoImage
                          src={p.logoUrl}
                          alt={p.title}
                          sizeClassName="w-10 h-10 text-sm"
                          className="rounded-lg border border-[#EAF4EC]"
                        />
                        <div>
                          <h4 className="font-bold text-[#17221B] text-base">
                            {p.title}
                          </h4>
                          <span className="text-xs font-medium text-[#166534]">
                            Category: {p.category.name}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        PENDING
                      </span>
                    </div>

                    <p className="text-xs text-[#59645D] line-clamp-2">
                      {p.tagline}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-[#59645D]">
                      <a
                        href={p.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:text-[#17221B] underline"
                      >
                        <Github className="w-3.5 h-3.5" />
                        Repository ({p.githubStars.toLocaleString()} ⭐)
                      </a>
                      {p.websiteUrl && (
                        <a
                          href={p.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 hover:text-[#17221B] underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Website
                        </a>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/60">
                      <button
                        onClick={() => updateStatus(p.id, "REJECTED")}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => updateStatus(p.id, "APPROVED")}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#166534] hover:bg-[#11522a] transition-colors"
                      >
                        Approve & Publish
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Newsletter Subscribers */}
        {activeTab === "subscribers" && (
          <div className="bg-white rounded-xl border border-[#DCE4DD] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#17221B]">
                  Newsletter Subscribers ({subscribers.length})
                </h3>
                <p className="text-xs text-[#59645D]">
                  Users registered to receive open-source software recommendations.
                </p>
              </div>

              <button
                onClick={exportSubscribers}
                disabled={subscribers.length === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#DCE4DD] bg-white text-[#17221B] hover:bg-[#F7F8F5] transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            {subscribers.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#59645D] border border-dashed border-[#DCE4DD] rounded-lg">
                No newsletter subscribers yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#EAF4EC] bg-[#F7F8F5] text-[#59645D] font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Email Address</th>
                      <th className="py-3 px-4 text-right">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAF4EC]">
                    {subscribers.map((s) => (
                      <tr key={s.id} className="hover:bg-[#F7F8F5]/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-[#17221B]">
                          {s.email}
                        </td>
                        <td className="py-3 px-4 text-right text-[#59645D]">
                          {new Date(s.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

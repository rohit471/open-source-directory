"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface DirectoryToolbarProps {
  totalCount?: number;
}

export function DirectoryToolbar({ totalCount }: DirectoryToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") || "";
  const currentSort = searchParams.get("sort") || "stars";

  const [query, setQuery] = useState(currentQuery);

  useEffect(() => {
    setQuery(currentQuery);
  }, [currentQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = query.trim();
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    router.push(`/?${params.toString()}`);
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    router.push(`/?${params.toString()}`);
  };

  const clearSearch = () => {
    setQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    router.push(`/?${params.toString()}`);
  };

  const setShortcutQuery = (shortcut: string) => {
    setQuery(shortcut);
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", shortcut);
    router.push(`/?${params.toString()}`);
  };

  return (
    <div id="directory" className="py-5 border-b border-[#DCE4DD] mb-6">
      <div className="flex flex-col gap-4">
        {/* Main Toolbar Row: Search + Sort & Count */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearch} className="relative flex-1 max-w-xl">
            <label htmlFor="directory-search-input" className="sr-only">
              Search tools by name, tag, or proprietary alternative
            </label>
            <div className="relative flex items-center">
              <input
                id="directory-search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What SaaS are you replacing? (e.g., Figma, Firebase)..."
                className="w-full h-11 pl-9 pr-24 rounded-lg border border-[#DCE4DD] bg-white text-[#17221B] text-xs sm:text-sm placeholder:text-[#59645D]/70 focus:outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20 transition-all shadow-2xs"
              />
              <Search className="w-4 h-4 text-[#59645D] absolute left-3 pointer-events-none" />

              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="absolute right-20 w-7 h-7 flex items-center justify-center text-[#59645D] hover:text-[#17221B] rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#166534]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="submit"
                className="absolute right-1.5 h-8 px-4 rounded-md bg-[#166534] hover:bg-[#11522a] text-white text-xs font-semibold transition-all flex items-center justify-center shadow-2xs active:scale-95 cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Sorting Dropdown & Count */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 text-xs">
            {typeof totalCount === "number" && (
              <span
                aria-live="polite"
                aria-atomic="true"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF4EC] text-[#166534] font-semibold border border-[#DCE4DD] text-xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#166534]" />
                {totalCount} {totalCount === 1 ? "tool verified" : "tools verified"}
              </span>
            )}

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#59645D]" />
              <select
                aria-label="Sort projects"
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="h-10 px-3 rounded-lg border border-[#DCE4DD] bg-white text-[#17221B] text-xs font-medium focus:outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20 min-h-[40px] hover:border-[#166534]/40 transition-all cursor-pointer shadow-2xs"
              >
                <option value="stars">Most Stars (Descending)</option>
                <option value="name">Name (A-Z)</option>
                <option value="featured">Editor's Featured</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Replacement Shortcuts */}
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
          <span className="text-[#59645D] font-medium text-[11px] uppercase tracking-wider">
            Popular Alternatives:
          </span>
          {["Firebase", "Figma", "Calendly", "Google Analytics", "Mixpanel", "Zapier"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setShortcutQuery(item)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer border ${
                currentQuery.toLowerCase() === item.toLowerCase()
                  ? "bg-[#166534] text-white border-[#166534]"
                  : "bg-white text-[#17221B] border-[#DCE4DD] hover:bg-[#EAF4EC] hover:text-[#166534]"
              }`}
            >
              {item}
            </button>
          ))}
          {currentQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="text-xs text-[#59645D] underline hover:text-[#17221B] ml-1"
            >
              Reset filter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


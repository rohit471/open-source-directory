"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, PlusCircle, Menu, X } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle Escape key dismissal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-[#DCE4DD] transition-all duration-200">
      <div className="container-custom">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Logo - Aligned Left */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 transition-all shrink-0"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#166534] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs group-hover:bg-[#11522a] transition-colors">
              <Code2 className="w-4 h-4" />
            </div>
            <div className="flex items-baseline text-base sm:text-lg tracking-tight font-bold text-[#17221B]">
              <span>OpenSource</span>
              <span className="font-normal italic text-[#166534] ml-1 hidden xs:inline">
                Market
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#59645D]"
          >
            <Link
              href="/alternatives"
              className="hover:text-[#17221B] transition-colors py-1"
            >
              Alternatives
            </Link>

            <Link
              href="/categories"
              className="hover:text-[#17221B] transition-colors py-1"
            >
              Categories
            </Link>

            <Link
              href="/admin"
              className="hover:text-[#17221B] transition-colors py-1 font-semibold text-[#166534]"
            >
              Admin
            </Link>
          </nav>

          {/* Right Action Button - Aligned Right */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/submit"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#166534] text-white hover:bg-[#11522a] transition-all shrink-0 active:scale-95 shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Submit Tool</span>
            </Link>

            {/* Mobile Hamburger (44px min touch target) */}
            <button
              type="button"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-[#DCE4DD] bg-white text-[#17221B] hover:bg-[#EAF4EC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#166534] shrink-0"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          className="md:hidden border-t border-[#DCE4DD] bg-white text-[#17221B] px-4 pt-4 pb-6 space-y-3 shadow-lg"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#59645D] px-2">
            Directory Index
          </p>
          <Link
            href="/alternatives"
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#17221B] hover:bg-[#EAF4EC] hover:text-[#166534]"
          >
            SaaS Alternatives
          </Link>
          <Link
            href="/categories"
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#17221B] hover:bg-[#EAF4EC] hover:text-[#166534]"
          >
            Categories
          </Link>
          <Link
            href="/admin"
            className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#166534] hover:bg-[#EAF4EC]"
          >
            Admin Dashboard
          </Link>
        </div>
      )}
    </header>
  );
}


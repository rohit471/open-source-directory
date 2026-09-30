import Link from "next/link";
import { Code2, Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card text-muted-foreground mt-16 py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-sm shadow-xs">
                <Code2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-foreground text-lg tracking-tight">
                OpenSource Market
              </span>
            </Link>
            <p className="text-xs sm:text-sm max-w-sm text-muted-foreground leading-relaxed">
              Discover top open-source software, free privacy-focused tools, and community-driven alternatives to proprietary SaaS products.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground text-sm mb-3">Explore</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  All Projects
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-foreground transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/alternatives" className="hover:text-foreground transition-colors">
                  SaaS Alternatives
                </Link>
              </li>
              <li>
                <Link href="/submit" className="hover:text-foreground transition-colors">
                  Submit a Tool
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-foreground transition-colors font-medium text-[#166534]">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs gap-4 text-muted-foreground">
          <p>© {new Date().getFullYear()} OpenSource Market. Premium editorial guide to open-source software.</p>
          <div className="flex items-center gap-4 font-medium">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/alternatives" className="hover:text-foreground transition-colors">
              Alternatives
            </Link>
            <Link href="/categories" className="hover:text-foreground transition-colors">
              Categories
            </Link>
            <Link href="/admin" className="hover:text-foreground transition-colors text-[#166534]">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}



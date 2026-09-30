import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "OpenSource Market | Discover Top Open-Source Software & SaaS Alternatives",
  description: "Directory of high-quality open-source software, developer tools, and privacy-first alternatives to proprietary SaaS products.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="flex flex-col min-h-screen bg-background text-foreground antialiased selection:bg-foreground selection:text-background">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

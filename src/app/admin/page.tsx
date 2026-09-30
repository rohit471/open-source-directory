import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminDashboard } from "./admin-dashboard";

export const revalidate = 0;

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/admin/login");
  }
  const projects = await prisma.project.findMany({
    include: {
      category: true,
      alternativeTo: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const alternatives = await prisma.alternativeTo.findMany({
    orderBy: { name: "asc" },
  });

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    totalProjects: projects.length,
    approvedProjects: projects.filter((p) => p.status === "APPROVED").length,
    pendingProjects: projects.filter((p) => p.status === "PENDING").length,
    featuredProjects: projects.filter((p) => p.featured).length,
    totalStars: projects.reduce((acc, p) => acc + (p.githubStars || 0), 0),
    totalCategories: categories.length,
    totalAlternatives: alternatives.length,
    totalSubscribers: subscribers.length,
  };

  // Format dates to strings for initial serialization
  const formattedProjects = projects.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  const formattedSubscribers = subscribers.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <div className="container-custom py-8">
      <AdminDashboard
        initialStats={stats}
        initialProjects={formattedProjects}
        initialCategories={categories}
        initialAlternatives={alternatives}
        initialSubscribers={formattedSubscribers}
      />
    </div>
  );
}

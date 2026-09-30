import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      include: {
        category: true,
        alternativeTo: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const categoryCount = await prisma.category.count();
    const alternativeCount = await prisma.alternativeTo.count();
    const subscriberCount = await prisma.newsletterSubscriber.count();

    const stats = {
      totalProjects: projects.length,
      approvedProjects: projects.filter((p) => p.status === "APPROVED").length,
      pendingProjects: projects.filter((p) => p.status === "PENDING").length,
      featuredProjects: projects.filter((p) => p.featured).length,
      totalStars: projects.reduce((acc, p) => acc + (p.githubStars || 0), 0),
      totalCategories: categoryCount,
      totalAlternatives: alternativeCount,
      totalSubscribers: subscriberCount,
    };

    return NextResponse.json({
      success: true,
      stats,
      projects,
    });
  } catch (error: any) {
    console.error("Admin API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin statistics and projects." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, status, featured, categoryId, alternativeToId, tagline, title } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required." },
        { status: 400 }
      );
    }

    const dataToUpdate: any = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (featured !== undefined) dataToUpdate.featured = featured;
    if (categoryId !== undefined) dataToUpdate.categoryId = categoryId;
    if (alternativeToId !== undefined) dataToUpdate.alternativeToId = alternativeToId;
    if (tagline !== undefined) dataToUpdate.tagline = tagline;
    if (title !== undefined) dataToUpdate.title = title;

    const updatedProject = await prisma.project.update({
      where: { id },
      data: dataToUpdate,
      include: {
        category: true,
        alternativeTo: true,
      },
    });

    return NextResponse.json({
      success: true,
      project: updatedProject,
      message: `Project "${updatedProject.title}" updated successfully.`,
    });
  } catch (error: any) {
    console.error("Admin Project Update Error:", error);
    return NextResponse.json(
      { error: "Failed to update project." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required." },
        { status: 400 }
      );
    }

    const deleted = await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Project "${deleted.title}" deleted successfully.`,
    });
  } catch (error: any) {
    console.error("Admin Project Delete Error:", error);
    return NextResponse.json(
      { error: "Failed to delete project." },
      { status: 500 }
    );
  }
}

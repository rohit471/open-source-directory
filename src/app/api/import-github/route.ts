import { NextResponse } from "next/server";
import { fetchGitHubRepoData } from "@/lib/github-importer";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, autoPublish } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "A valid GitHub URL or owner/repo path is required." },
        { status: 400 }
      );
    }

    // Fetch repository details from GitHub API
    const repoData = await fetchGitHubRepoData(url);

    // Fetch all categories from database to auto-match category
    const categories = await prisma.category.findMany();
    let matchedCategoryId = categories[0]?.id || "";

    const fullText = `${repoData.title} ${repoData.tagline} ${repoData.topics.join(" ")} ${repoData.language || ""}`.toLowerCase();

    if (fullText.includes("database") || fullText.includes("postgres") || fullText.includes("sql") || fullText.includes("backend") || fullText.includes("baas") || fullText.includes("firebase")) {
      const cat = categories.find((c) => c.slug === "database-backend");
      if (cat) matchedCategoryId = cat.id;
    } else if (fullText.includes("analytic") || fullText.includes("metric") || fullText.includes("track") || fullText.includes("insight")) {
      const cat = categories.find((c) => c.slug === "analytics-data");
      if (cat) matchedCategoryId = cat.id;
    } else if (fullText.includes("ai") || fullText.includes("llm") || fullText.includes("gpt") || fullText.includes("model") || fullText.includes("prompt")) {
      const cat = categories.find((c) => c.slug === "ai-ml");
      if (cat) matchedCategoryId = cat.id;
    } else if (fullText.includes("design") || fullText.includes("proto") || fullText.includes("figma") || fullText.includes("vector") || fullText.includes("svg")) {
      const cat = categories.find((c) => c.slug === "design-media");
      if (cat) matchedCategoryId = cat.id;
    } else if (fullText.includes("workflow") || fullText.includes("automation") || fullText.includes("schedule") || fullText.includes("task") || fullText.includes("zapier")) {
      const cat = categories.find((c) => c.slug === "productivity-workflow");
      if (cat) matchedCategoryId = cat.id;
    } else {
      const cat = categories.find((c) => c.slug === "developer-tools");
      if (cat) matchedCategoryId = cat.id;
    }

    // Auto-match AlternativeTo SaaS target if applicable
    let suggestedAlternativeName = "";
    if (fullText.includes("firebase")) suggestedAlternativeName = "Firebase";
    else if (fullText.includes("mixpanel")) suggestedAlternativeName = "Mixpanel";
    else if (fullText.includes("google analytics") || fullText.includes("ga4")) suggestedAlternativeName = "Google Analytics";
    else if (fullText.includes("figma")) suggestedAlternativeName = "Figma";
    else if (fullText.includes("calendly")) suggestedAlternativeName = "Calendly";
    else if (fullText.includes("zapier")) suggestedAlternativeName = "Zapier";

    // If autoPublish flag is set, insert directly into database
    if (autoPublish) {
      const baseSlug = repoData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      let slug = baseSlug;
      let count = 1;
      while (await prisma.project.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${count++}`;
      }

      let alternativeToId: string | undefined = undefined;
      if (suggestedAlternativeName) {
        const altSlug = suggestedAlternativeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        let altTarget = await prisma.alternativeTo.findUnique({ where: { slug: altSlug } });
        if (!altTarget) {
          altTarget = await prisma.alternativeTo.create({
            data: { name: suggestedAlternativeName, slug: altSlug },
          });
        }
        alternativeToId = altTarget.id;
      }

      const newProject = await prisma.project.create({
        data: {
          title: repoData.title,
          slug,
          tagline: repoData.tagline,
          description: repoData.description,
          websiteUrl: repoData.websiteUrl,
          githubUrl: repoData.githubUrl,
          githubStars: repoData.githubStars,
          license: repoData.license,
          logoUrl: repoData.logoUrl,
          categoryId: matchedCategoryId,
          alternativeToId,
          featured: false,
          status: "APPROVED",
        },
      });

      return NextResponse.json({
        success: true,
        project: newProject,
        message: `Successfully imported "${repoData.title}" directly from GitHub!`,
      });
    }

    // Return prefilled data object for form auto-fill
    return NextResponse.json({
      success: true,
      data: {
        title: repoData.title,
        tagline: repoData.tagline,
        description: repoData.description,
        websiteUrl: repoData.websiteUrl,
        githubUrl: repoData.githubUrl,
        githubStars: repoData.githubStars,
        license: repoData.license,
        logoUrl: repoData.logoUrl,
        categoryId: matchedCategoryId,
        alternativeToName: suggestedAlternativeName,
        topics: repoData.topics,
      },
    });
  } catch (error: any) {
    console.error("GitHub Import API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to import GitHub repository data." },
      { status: 500 }
    );
  }
}

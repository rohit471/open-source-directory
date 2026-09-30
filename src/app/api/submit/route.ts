import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let {
      title,
      tagline,
      description,
      websiteUrl,
      githubUrl,
      license,
      customLicense,
      categoryId,
      alternativeToName,
      isFeatured,
    } = body;

    // Sanitize and trim strings
    title = (title || "").trim();
    tagline = (tagline || "").trim();
    description = (description || "").trim();
    websiteUrl = (websiteUrl || "").trim();
    githubUrl = (githubUrl || "").trim();
    license = (license || "").trim();
    customLicense = (customLicense || "").trim();
    categoryId = (categoryId || "").trim();
    alternativeToName = (alternativeToName || "").trim();

    const finalLicense = license === "OTHER" ? customLicense : license;

    // Field validations
    const errors: Record<string, string> = {};

    if (!title || title.length < 2 || title.length > 100) {
      errors.title = "Title is required and must be between 2 and 100 characters.";
    }

    if (!tagline || tagline.length < 10 || tagline.length > 200) {
      errors.tagline = "Tagline is required and must be between 10 and 200 characters.";
    }

    if (!websiteUrl || !isValidUrl(websiteUrl)) {
      errors.websiteUrl = "A valid website URL starting with http:// or https:// is required.";
    }

    if (!githubUrl || !isValidUrl(githubUrl) || !githubUrl.toLowerCase().includes("github.com/")) {
      errors.githubUrl = "A valid GitHub repository URL (e.g. https://github.com/org/repo) is required.";
    }

    if (!categoryId) {
      errors.categoryId = "Please select a category for your project.";
    } else {
      const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!categoryExists) {
        errors.categoryId = "Selected category does not exist.";
      }
    }

    if (!finalLicense) {
      errors.license = "Please specify a software license.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    // Generate unique slug
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    let slug = baseSlug;
    let count = 1;
    while (await prisma.project.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    // Optional AlternativeTo SaaS target
    let alternativeToId: string | undefined = undefined;
    if (alternativeToName) {
      const altSlug = alternativeToName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      let altTarget = await prisma.alternativeTo.findUnique({ where: { slug: altSlug } });
      if (!altTarget) {
        altTarget = await prisma.alternativeTo.create({
          data: { name: alternativeToName, slug: altSlug },
        });
      }
      alternativeToId = altTarget.id;
    }

    // Get or create License reference
    let licenseId: string | undefined = undefined;
    const licSlug = finalLicense.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    let licRef = await prisma.license.findUnique({ where: { slug: licSlug } });
    if (!licRef && finalLicense) {
      licRef = await prisma.license.create({
        data: { name: finalLicense, slug: licSlug },
      });
    }
    if (licRef) {
      licenseId = licRef.id;
    }

    // Create project record in moderation queue
    const newProject = await prisma.project.create({
      data: {
        title,
        slug,
        tagline,
        description: description || tagline,
        websiteUrl,
        githubUrl,
        license: finalLicense,
        licenseId,
        githubStars: 0,
        categoryId,
        alternativeToId,
        featured: Boolean(isFeatured),
        status: "APPROVED", // Auto-publish for demo directory
        planType: isFeatured ? "FEATURED" : "FREE",
      },
    });

    return NextResponse.json({
      success: true,
      project: newProject,
      message: isFeatured
        ? "Project submitted! Our editorial team will review your project and email payment instructions for Featured placement."
        : "Project submitted! Your open source tool is now live in the directory.",
    });
  } catch (error) {
    console.error("Submission API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

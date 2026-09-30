import { fetchGitHubRepoData } from "../src/lib/github-importer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log(`
OpenSource Market — GitHub 1-Click Import CLI

Usage:
  npx tsx scripts/import-github.ts <github-url-1> <github-url-2> ...

Example:
  npx tsx scripts/import-github.ts https://github.com/grafana/grafana https://github.com/appwrite/appwrite
`);
    process.exit(0);
  }

  const categories = await prisma.category.findMany();
  if (categories.length === 0) {
    console.error("No categories found in database. Please run npm run seed first.");
    process.exit(1);
  }

  for (const targetUrl of args) {
    console.log(`\n----------------------------------------`);
    console.log(`Fetching repo: ${targetUrl}...`);

    try {
      const repoData = await fetchGitHubRepoData(targetUrl);
      console.log(`✔ Title: ${repoData.title}`);
      console.log(`✔ Stars: ${repoData.githubStars.toLocaleString()}`);
      console.log(`✔ License: ${repoData.license}`);
      console.log(`✔ Tagline: ${repoData.tagline}`);

      // Category matching
      let matchedCategoryId = categories[0].id;
      const fullText = `${repoData.title} ${repoData.tagline} ${repoData.topics.join(" ")} ${repoData.language || ""}`.toLowerCase();

      const getCat = (slug: string) => categories.find((c) => c.slug === slug)?.id;

      if (fullText.includes("database") || fullText.includes("postgres") || fullText.includes("sql") || fullText.includes("baas") || fullText.includes("cms") || fullText.includes("headless") || fullText.includes("auth") || fullText.includes("identity")) {
        matchedCategoryId = getCat("database-backend") || matchedCategoryId;
      } else if (fullText.includes("analytic") || fullText.includes("metric") || fullText.includes("bi ") || fullText.includes("business intelligence") || fullText.includes("telemetry") || fullText.includes("observability")) {
        matchedCategoryId = getCat("analytics-data") || matchedCategoryId;
      } else if (fullText.includes("ai ") || fullText.includes("llm") || fullText.includes("gpt") || fullText.includes("rag") || fullText.includes("agent") || fullText.includes("model")) {
        matchedCategoryId = getCat("ai-ml") || matchedCategoryId;
      } else if (fullText.includes("design") || fullText.includes("proto") || fullText.includes("figma") || fullText.includes("audio") || fullText.includes("vector")) {
        matchedCategoryId = getCat("design-media") || matchedCategoryId;
      } else if (fullText.includes("workflow") || fullText.includes("automation") || fullText.includes("task") || fullText.includes("collaboration") || fullText.includes("workspace") || fullText.includes("notion") || fullText.includes("slack") || fullText.includes("airtable") || fullText.includes("schedule")) {
        matchedCategoryId = getCat("productivity-workflow") || matchedCategoryId;
      } else {
        matchedCategoryId = getCat("developer-tools") || matchedCategoryId;
      }

      // AlternativeTo SaaS matching
      let suggestedAlternativeName = "";
      if (fullText.includes("firebase")) suggestedAlternativeName = "Firebase";
      else if (fullText.includes("mixpanel")) suggestedAlternativeName = "Mixpanel";
      else if (fullText.includes("google analytics")) suggestedAlternativeName = "Google Analytics";
      else if (fullText.includes("figma")) suggestedAlternativeName = "Figma";
      else if (fullText.includes("calendly")) suggestedAlternativeName = "Calendly";
      else if (fullText.includes("zapier")) suggestedAlternativeName = "Zapier";
      else if (fullText.includes("postman") || fullText.includes("insomnia")) suggestedAlternativeName = "Postman";
      else if (fullText.includes("datadog")) suggestedAlternativeName = "Datadog";
      else if (fullText.includes("slack")) suggestedAlternativeName = "Slack";
      else if (fullText.includes("notion")) suggestedAlternativeName = "Notion";
      else if (fullText.includes("airtable")) suggestedAlternativeName = "Airtable";
      else if (fullText.includes("tableau")) suggestedAlternativeName = "Tableau";
      else if (fullText.includes("openai")) suggestedAlternativeName = "OpenAI API";
      else if (fullText.includes("docker")) suggestedAlternativeName = "Docker Desktop";
      else if (fullText.includes("auth0")) suggestedAlternativeName = "Auth0";
      else if (fullText.includes("buffer") || fullText.includes("hootsuite")) suggestedAlternativeName = "Buffer";
      else if (fullText.includes("contentful")) suggestedAlternativeName = "Contentful";
      else if (fullText.includes("snowflake")) suggestedAlternativeName = "Snowflake";
      else if (fullText.includes("algolia")) suggestedAlternativeName = "Algolia";
      else if (fullText.includes("adobe audition")) suggestedAlternativeName = "Adobe Audition";

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

      const project = await prisma.project.create({
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

      console.log(`✅ Successfully added "${project.title}" to directory! (Slug: ${project.slug})`);
    } catch (err: any) {
      console.error(`❌ Error importing "${targetUrl}":`, err.message);
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());

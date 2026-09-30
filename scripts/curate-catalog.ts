import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATALOG_CURATION: Record<
  string,
  {
    categorySlug: string;
    alternativeName?: string;
    featured?: boolean;
    titleOverride?: string;
    taglineOverride?: string;
  }
> = {
  // Database & Backend
  supabase: { categorySlug: "database-backend", alternativeName: "Firebase", featured: true },
  appwrite: { categorySlug: "database-backend", alternativeName: "Firebase", featured: true },
  pocketbase: { categorySlug: "database-backend", alternativeName: "Firebase" },
  strapi: { categorySlug: "database-backend", alternativeName: "Contentful", featured: true },
  clickhouse: { categorySlug: "database-backend", alternativeName: "Snowflake" },
  surrealdb: { categorySlug: "database-backend", alternativeName: "DynamoDB" },
  typesense: { categorySlug: "database-backend", alternativeName: "Algolia" },
  minio: { categorySlug: "database-backend", alternativeName: "AWS S3", featured: true },
  directus: { categorySlug: "database-backend", alternativeName: "Contentful" },
  questdb: { categorySlug: "database-backend", alternativeName: "InfluxDB" },

  // Developer Tools
  hoppscotch: { categorySlug: "developer-tools", alternativeName: "Postman", featured: true },
  keycloak: { categorySlug: "developer-tools", alternativeName: "Auth0" },
  podman: { categorySlug: "developer-tools", alternativeName: "Docker Desktop" },
  meilisearch: { categorySlug: "developer-tools", alternativeName: "Algolia" },
  grafana: { categorySlug: "developer-tools", alternativeName: "Datadog", featured: true },
  "postiz-app": { categorySlug: "developer-tools", alternativeName: "Buffer" },
  uv: { categorySlug: "developer-tools", alternativeName: "Pip / PyPI", featured: true },
  ui: { categorySlug: "developer-tools", alternativeName: "Tailwind UI", featured: true, titleOverride: "shadcn/ui" },
  "shadcn-ui": { categorySlug: "developer-tools", alternativeName: "Tailwind UI", featured: true, titleOverride: "shadcn/ui" },
  gitleaks: { categorySlug: "developer-tools", alternativeName: "GitGuard" },
  tauri: { categorySlug: "developer-tools", alternativeName: "Electron", featured: true },
  caddy: { categorySlug: "developer-tools", alternativeName: "Nginx" },

  // Analytics & Data
  metabase: { categorySlug: "analytics-data", alternativeName: "Tableau", featured: true },
  matomo: { categorySlug: "analytics-data", alternativeName: "Google Analytics" },
  posthog: { categorySlug: "analytics-data", alternativeName: "Mixpanel", featured: true },
  "plausible-analytics": { categorySlug: "analytics-data", alternativeName: "Google Analytics" },
  umami: { categorySlug: "analytics-data", alternativeName: "Google Analytics", featured: true },
  "opentelemetry-collector": { categorySlug: "analytics-data", alternativeName: "Datadog APM" },
  superset: { categorySlug: "analytics-data", alternativeName: "Tableau", featured: true, titleOverride: "Apache Superset" },
  lightdash: { categorySlug: "analytics-data", alternativeName: "Looker" },
  loki: { categorySlug: "analytics-data", alternativeName: "Datadog Logs" },

  // Productivity & Workflow
  mattermost: { categorySlug: "productivity-workflow", alternativeName: "Slack" },
  appflowy: { categorySlug: "productivity-workflow", alternativeName: "Notion", featured: true },
  nocodb: { categorySlug: "productivity-workflow", alternativeName: "Airtable", featured: true },
  activepieces: { categorySlug: "productivity-workflow", alternativeName: "Zapier" },
  n8n: { categorySlug: "productivity-workflow", alternativeName: "Zapier", featured: true },
  "cal-com": { categorySlug: "productivity-workflow", alternativeName: "Calendly" },
  joplin: { categorySlug: "productivity-workflow", alternativeName: "Evernote", featured: true },
  app: { categorySlug: "productivity-workflow", alternativeName: "Apple Notes", titleOverride: "Standard Notes" },
  "element-web": { categorySlug: "productivity-workflow", alternativeName: "Slack", titleOverride: "Element" },
  "paperless-ngx": { categorySlug: "productivity-workflow", alternativeName: "DocuWare" },
  plane: { categorySlug: "productivity-workflow", alternativeName: "Jira / Linear", featured: true },

  // AI & ML
  ollama: { categorySlug: "ai-ml", alternativeName: "OpenAI API", featured: true },
  dify: { categorySlug: "ai-ml", alternativeName: "LangChain", featured: true },
  localai: { categorySlug: "ai-ml", alternativeName: "OpenAI API" },
  langfuse: { categorySlug: "ai-ml", alternativeName: "LangChain" },
  "stable-diffusion-webui": { categorySlug: "ai-ml", alternativeName: "Midjourney", featured: true, titleOverride: "Stable Diffusion WebUI" },
  "open-webui": { categorySlug: "ai-ml", alternativeName: "ChatGPT Plus", featured: true, titleOverride: "Open WebUI" },
  vllm: { categorySlug: "ai-ml", alternativeName: "TensorRT-LLM", featured: true },
  flowise: { categorySlug: "ai-ml", alternativeName: "LangChain" },
  crewai: { categorySlug: "ai-ml", alternativeName: "AutoGPT", featured: true },

  // Design & Media
  penpot: { categorySlug: "design-media", alternativeName: "Figma", featured: true },
  audacity: { categorySlug: "design-media", alternativeName: "Adobe Audition" },
  inkscape: { categorySlug: "design-media", alternativeName: "Adobe Illustrator" },
  "obs-studio": { categorySlug: "design-media", alternativeName: "Camtasia / Loom", featured: true, titleOverride: "OBS Studio" },
  krita: { categorySlug: "design-media", alternativeName: "Adobe Photoshop" },
  shotcut: { categorySlug: "design-media", alternativeName: "Adobe Premiere" },
  excalidraw: { categorySlug: "design-media", alternativeName: "Miro / Lucidchart", featured: true },
};

async function main() {
  console.log("Starting full catalog cleanup & curation for expanded dataset...");

  // 1. Clean up duplicate projects
  const allProjects = await prisma.project.findMany();

  const grouped: Record<string, typeof allProjects> = {};
  for (const p of allProjects) {
    const key = p.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  }

  for (const [key, group] of Object.entries(grouped)) {
    if (group.length > 1) {
      group.sort((a, b) => b.githubStars - a.githubStars);
      const keep = group[0];
      const remove = group.slice(1);
      console.log(`Found duplicate group for "${keep.title}". Keeping ${keep.slug} (${keep.githubStars} stars), removing ${remove.map((r) => r.slug).join(", ")}`);
      for (const r of remove) {
        await prisma.project.delete({ where: { id: r.id } });
      }
      if (keep.slug.endsWith("-1")) {
        const cleanSlug = keep.slug.replace("-1", "");
        await prisma.project.update({ where: { id: keep.id }, data: { slug: cleanSlug } });
      }
    }
  }

  // 2. Refresh categories and alternativeTo relations
  const categories = await prisma.category.findMany();
  const catMap = new Map(categories.map((c) => [c.slug, c.id]));

  const projectsToUpdate = await prisma.project.findMany();

  for (const p of projectsToUpdate) {
    const cleanSlug = p.slug.replace("-1", "").toLowerCase();
    const config = CATALOG_CURATION[cleanSlug] || CATALOG_CURATION[p.title.toLowerCase().replace(/[^a-z0-9-]/g, "")];

    let categoryId = p.categoryId;
    let alternativeToId = p.alternativeToId;
    let featured = p.featured;
    let title = p.title;

    if (config) {
      if (config.categorySlug && catMap.has(config.categorySlug)) {
        categoryId = catMap.get(config.categorySlug)!;
      }
      if (config.featured !== undefined) {
        featured = config.featured;
      }
      if (config.titleOverride) {
        title = config.titleOverride;
      }
      if (config.alternativeName) {
        const altSlug = config.alternativeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        let altObj = await prisma.alternativeTo.findUnique({ where: { slug: altSlug } });
        if (!altObj) {
          altObj = await prisma.alternativeTo.create({
            data: { name: config.alternativeName, slug: altSlug },
          });
        }
        alternativeToId = altObj.id;
      }
    }

    // Ensure fallback logo URL if missing or broken
    let logoUrl = p.logoUrl;
    if (!logoUrl || logoUrl.includes("githubusercontent.com/null")) {
      const repoPath = p.githubUrl.replace("https://github.com/", "");
      logoUrl = `https://unavatar.io/github/${repoPath.split("/")[0]}`;
    }

    await prisma.project.update({
      where: { id: p.id },
      data: {
        title,
        categoryId,
        alternativeToId,
        featured,
        logoUrl,
        slug: cleanSlug,
      },
    });

    console.log(`✔ Curated "${title}" -> Cat: ${config?.categorySlug || "unchanged"} | Alt: ${config?.alternativeName || "None"} | Featured: ${featured}`);
  }

  const finalCount = await prisma.project.count();
  console.log(`\n✅ Curation complete! Total unique projects in directory: ${finalCount}`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());

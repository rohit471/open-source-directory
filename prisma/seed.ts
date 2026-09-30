import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding verified open-source dataset...");

  // Clean tables
  await prisma.project.deleteMany();
  await prisma.category.deleteMany();
  await prisma.alternativeTo.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.stack.deleteMany();
  await prisma.license.deleteMany();

  // Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Developer Tools", slug: "developer-tools", description: "SDKs, APIs, and dev platforms." } }),
    prisma.category.create({ data: { name: "Database & Backend", slug: "database-backend", description: "BaaS, SQL/NoSQL databases, and real-time backends." } }),
    prisma.category.create({ data: { name: "Analytics & Data", slug: "analytics-data", description: "Privacy-friendly analytics & product insight suites." } }),
    prisma.category.create({ data: { name: "Productivity & Workflow", slug: "productivity-workflow", description: "Automation, scheduling, and team collaboration." } }),
    prisma.category.create({ data: { name: "Design & Media", slug: "design-media", description: "Vector design, prototyping, and media tools." } }),
    prisma.category.create({ data: { name: "AI & ML", slug: "ai-ml", description: "LLM observability, prompt engineering, and agent frameworks." } }),
  ]);
  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  // Licenses
  const licenses = await Promise.all([
    prisma.license.create({ data: { name: "MIT", slug: "mit", description: "Permissive free software license." } }),
    prisma.license.create({ data: { name: "Apache-2.0", slug: "apache-2-0", description: "Permissive license with patent grants." } }),
    prisma.license.create({ data: { name: "AGPL-3.0", slug: "agpl-3-0", description: "Strong copyleft license for network software." } }),
    prisma.license.create({ data: { name: "MPL-2.0", slug: "mpl-2-0", description: "Weak copyleft file-based license." } }),
  ]);
  const licMap = Object.fromEntries(licenses.map((l) => [l.slug, l.id]));

  // Tech Stacks
  const stacks = await Promise.all([
    prisma.stack.create({ data: { name: "TypeScript", slug: "typescript" } }),
    prisma.stack.create({ data: { name: "Python", slug: "python" } }),
    prisma.stack.create({ data: { name: "Go", slug: "go" } }),
    prisma.stack.create({ data: { name: "Rust", slug: "rust" } }),
  ]);
  const stackMap = Object.fromEntries(stacks.map((s) => [s.slug, s.id]));

  // Tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "Authentication", slug: "authentication" } }),
    prisma.tag.create({ data: { name: "Docker", slug: "docker" } }),
    prisma.tag.create({ data: { name: "Privacy", slug: "privacy" } }),
    prisma.tag.create({ data: { name: "LLM", slug: "llm" } }),
    prisma.tag.create({ data: { name: "Database", slug: "database" } }),
  ]);
  const tagMap = Object.fromEntries(tags.map((t) => [t.slug, t.id]));

  // Alternatives Target SaaS
  const alternatives = await Promise.all([
    prisma.alternativeTo.create({ data: { name: "Firebase", slug: "firebase", website: "https://firebase.google.com" } }),
    prisma.alternativeTo.create({ data: { name: "Mixpanel", slug: "mixpanel", website: "https://mixpanel.com" } }),
    prisma.alternativeTo.create({ data: { name: "Google Analytics", slug: "google-analytics", website: "https://analytics.google.com" } }),
    prisma.alternativeTo.create({ data: { name: "Calendly", slug: "calendly", website: "https://calendly.com" } }),
    prisma.alternativeTo.create({ data: { name: "Figma", slug: "figma", website: "https://figma.com" } }),
    prisma.alternativeTo.create({ data: { name: "Zapier", slug: "zapier", website: "https://zapier.com" } }),
  ]);
  const altMap = Object.fromEntries(alternatives.map((a) => [a.slug, a.id]));

  // Projects with real stack, tag, license, and alternative associations
  const projectsData = [
    {
      title: "Supabase",
      slug: "supabase",
      tagline: "The open source Firebase alternative with Postgres, Auth, and Realtime APIs.",
      description: "Supabase provides all the backend services you need to build an enterprise application: Postgres database, Authentication, Instant APIs, Edge Functions, and Storage.",
      websiteUrl: "https://supabase.com",
      githubUrl: "https://github.com/supabase/supabase",
      githubStars: 78500,
      license: "Apache-2.0",
      licenseId: licMap["apache-2-0"],
      logoUrl: "https://supabase.com/gathers/images/supabase-logo-icon.png",
      featured: true,
      isSelfHosted: true,
      isAiNative: false,
      categoryId: catMap["database-backend"],
      alternativeToId: altMap["firebase"],
      stackSlugs: ["typescript", "go"],
      tagSlugs: ["authentication", "database", "docker"],
    },
    {
      title: "PostHog",
      slug: "posthog",
      tagline: "The open-source product analytics, session recording, and feature flags suite.",
      description: "PostHog is an all-in-one product analytics suite built for engineers. Analyze product usage, record user sessions, run feature flags, and conduct A/B tests with self-hosted privacy control.",
      websiteUrl: "https://posthog.com",
      githubUrl: "https://github.com/PostHog/posthog",
      githubStars: 24200,
      license: "MIT",
      licenseId: licMap["mit"],
      logoUrl: "https://posthog.com/brand/posthog-icon.svg",
      featured: true,
      isSelfHosted: true,
      isAiNative: false,
      categoryId: catMap["analytics-data"],
      alternativeToId: altMap["mixpanel"],
      stackSlugs: ["python", "typescript"],
      tagSlugs: ["privacy", "docker"],
    },
    {
      title: "Plausible Analytics",
      slug: "plausible-analytics",
      tagline: "Simple, lightweight, open source and privacy-friendly web analytics.",
      description: "Plausible is a lightweight (<1 KB) and open source web analytics tool. No cookies, fully compliant with GDPR, CCPA, and PECR out of the box.",
      websiteUrl: "https://plausible.io",
      githubUrl: "https://github.com/plausible/analytics",
      githubStars: 19800,
      license: "AGPL-3.0",
      licenseId: licMap["agpl-3-0"],
      logoUrl: "https://plausible.io/assets/images/icon/plausible_logo.svg",
      featured: true,
      isSelfHosted: true,
      isAiNative: false,
      categoryId: catMap["analytics-data"],
      alternativeToId: altMap["google-analytics"],
      stackSlugs: ["typescript"],
      tagSlugs: ["privacy", "docker"],
    },
    {
      title: "Cal.com",
      slug: "cal-com",
      tagline: "The open source scheduling infrastructure for everyone.",
      description: "Cal.com is an open source scheduling infrastructure tool that empowers individuals and teams to book meetings seamlessly with customizable booking links.",
      websiteUrl: "https://cal.com",
      githubUrl: "https://github.com/calcom/cal.com",
      githubStars: 33400,
      license: "AGPL-3.0",
      licenseId: licMap["agpl-3-0"],
      logoUrl: "https://cal.com/favicon.ico",
      featured: true,
      isSelfHosted: true,
      isAiNative: false,
      categoryId: catMap["productivity-workflow"],
      alternativeToId: altMap["calendly"],
      stackSlugs: ["typescript"],
      tagSlugs: ["docker"],
    },
    {
      title: "Penpot",
      slug: "penpot",
      tagline: "The open source design & prototyping platform built for cross-domain teams.",
      description: "Penpot is the first Open Source design and prototyping tool created for cross-domain teams based on open SVG web standards.",
      websiteUrl: "https://penpot.app",
      githubUrl: "https://github.com/penpot/penpot",
      githubStars: 31200,
      license: "MPL-2.0",
      licenseId: licMap["mpl-2-0"],
      logoUrl: "https://penpot.app/favicon.ico",
      featured: true,
      isSelfHosted: true,
      isAiNative: false,
      categoryId: catMap["design-media"],
      alternativeToId: altMap["figma"],
      stackSlugs: ["typescript"],
      tagSlugs: ["docker"],
    },
    {
      title: "n8n",
      slug: "n8n",
      tagline: "Fair-code workflow automation platform for technical teams.",
      description: "n8n is an extendable workflow automation tool that enables connecting anything to everything. Self-host n8n to integrate 400+ apps securely.",
      websiteUrl: "https://n8n.io",
      githubUrl: "https://github.com/n8n-io/n8n",
      githubStars: 52100,
      license: "AGPL-3.0",
      licenseId: licMap["agpl-3-0"],
      logoUrl: "https://n8n.io/favicon.ico",
      featured: false,
      isSelfHosted: true,
      isAiNative: false,
      categoryId: catMap["productivity-workflow"],
      alternativeToId: altMap["zapier"],
      stackSlugs: ["typescript"],
      tagSlugs: ["docker"],
    },
    {
      title: "Langfuse",
      slug: "langfuse",
      tagline: "Open source LLM engineering platform for tracing, evaluations, and prompt management.",
      description: "Langfuse is an open-source observability platform for AI applications. Monitor cost, latency, quality, and prompt iterations in real time.",
      websiteUrl: "https://langfuse.com",
      githubUrl: "https://github.com/langfuse/langfuse",
      githubStars: 7900,
      license: "MIT",
      licenseId: licMap["mit"],
      logoUrl: "https://langfuse.com/favicon.ico",
      featured: true,
      isSelfHosted: true,
      isAiNative: true,
      categoryId: catMap["ai-ml"],
      alternativeToId: undefined,
      stackSlugs: ["typescript", "python"],
      tagSlugs: ["llm", "docker"],
    },
    {
      title: "Meilisearch",
      slug: "meilisearch",
      tagline: "A lightning-fast, open-source, hyper-relevant search engine.",
      description: "Meilisearch is a RESTful search API. It serves as a ready-to-use search engine for developers who need instant search out of the box.",
      websiteUrl: "https://meilisearch.com",
      githubUrl: "https://github.com/meilisearch/meilisearch",
      githubStars: 46200,
      license: "MIT",
      licenseId: licMap["mit"],
      logoUrl: "https://meilisearch.com/favicon.ico",
      featured: false,
      isSelfHosted: true,
      isAiNative: false,
      categoryId: catMap["developer-tools"],
      alternativeToId: undefined,
      stackSlugs: ["rust"],
      tagSlugs: ["database", "docker"],
    },
  ];

  for (const item of projectsData) {
    const { stackSlugs, tagSlugs, ...pData } = item;
    await prisma.project.create({
      data: {
        ...pData,
        stacks: {
          connect: stackSlugs.map((slug) => ({ id: stackMap[slug] })),
        },
        tags: {
          connect: tagSlugs.map((slug) => ({ id: tagMap[slug] })),
        },
      },
    });
  }

  console.log("Seeding verified OpenSource Market data complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

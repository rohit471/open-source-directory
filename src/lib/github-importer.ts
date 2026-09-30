export interface GitHubImportData {
  owner: string;
  repo: string;
  title: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  githubUrl: string;
  githubStars: number;
  license: string;
  logoUrl: string;
  topics: string[];
  language?: string | null;
}

export function parseGitHubRepoUrl(urlInput: string): { owner: string; repo: string } | null {
  if (!urlInput) return null;

  const trimmed = urlInput.trim();
  // Handle formats like:
  // https://github.com/supabase/supabase
  // http://github.com/supabase/supabase/
  // github.com/supabase/supabase
  // supabase/supabase
  const match = trimmed.match(/(?:github\.com\/|^)([a-zA-Z0-9_-]+)\/([a-zA-Z0-9._-]+)/i);
  if (!match) return null;

  const owner = match[1];
  const repo = match[2].replace(/\.git$/i, "");
  return { owner, repo };
}

export async function fetchGitHubRepoData(urlOrPath: string): Promise<GitHubImportData> {
  const parsed = parseGitHubRepoUrl(urlOrPath);
  if (!parsed) {
    throw new Error("Invalid GitHub repository URL or format. Expected e.g. https://github.com/owner/repo");
  }

  const { owner, repo } = parsed;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "OpenSourceMarket-DirectoryApp",
  };

  // Optional: support GITHUB_TOKEN environment variable if set to avoid rate limits
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(apiUrl, { headers, next: { revalidate: 3600 } });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`GitHub repository "${owner}/${repo}" was not found.`);
    }
    if (response.status === 403) {
      throw new Error("GitHub API rate limit reached. Please try again in a few minutes.");
    }
    throw new Error(`GitHub API request failed with status ${response.status}`);
  }

  const data = await response.json();

  // Capitalize name cleanly (e.g., supabase -> Supabase, posthog -> PostHog, calcom -> Calcom)
  const formatName = (str: string) => {
    if (!str) return str;
    if (str.toLowerCase() === "supabase") return "Supabase";
    if (str.toLowerCase() === "posthog") return "PostHog";
    if (str.toLowerCase() === "meilisearch") return "Meilisearch";
    if (str.toLowerCase() === "langfuse") return "Langfuse";
    if (str.toLowerCase() === "penpot") return "Penpot";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const title = formatName(data.name || repo);
  const tagline = (data.description || `Open source ${title} software.`).slice(0, 180);
  const websiteUrl = data.homepage && data.homepage.startsWith("http")
    ? data.homepage
    : data.html_url;

  const licenseSpdx = data.license?.spdx_id;
  const licenseName = data.license?.name;
  let license = "MIT";

  if (licenseSpdx && licenseSpdx !== "NOASSERTION") {
    license = licenseSpdx;
  } else if (licenseName) {
    license = licenseName;
  }

  const logoUrl = data.owner?.avatar_url || `https://github.com/${owner}.png`;
  const topics: string[] = Array.isArray(data.topics) ? data.topics : [];

  return {
    owner,
    repo,
    title,
    tagline,
    description: data.description || tagline,
    websiteUrl,
    githubUrl: data.html_url || `https://github.com/${owner}/${repo}`,
    githubStars: data.stargazers_count || 0,
    license,
    logoUrl,
    topics,
    language: data.language || null,
  };
}

import { NextRequest, NextResponse } from "next/server";

export interface RedditComment {
  author: string;
  body: string;
  subreddit: string;
  upvotes: number;
  avatarUrl: string | null;
  permalink: string;
}

// ─── Avatar cache ────────────────────────────────────────────────────────────

const avatarCache = new Map<string, string | null>();

async function fetchAvatar(username: string): Promise<string | null> {
  if (username === "[deleted]" || username === "AutoModerator") return null;
  if (avatarCache.has(username)) return avatarCache.get(username)!;

  try {
    const res = await fetch(
      `https://www.reddit.com/user/${encodeURIComponent(username)}/about.json`,
      {
        headers: { "User-Agent": "Picksy/1.0 (electronics recommendation app)" },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) { avatarCache.set(username, null); return null; }
    const data = await res.json();
    const icon: string = data?.data?.icon_img || data?.data?.snoovatar_img || "";
    const clean = icon ? icon.split("?")[0] : null;
    avatarCache.set(username, clean);
    return clean;
  } catch {
    avatarCache.set(username, null);
    return null;
  }
}

// ─── Reddit JSON API (works on local; often IP-blocked on Vercel) ─────────────

interface RedditCommentData {
  author?: string;
  body?: string;
  subreddit?: string;
  ups?: number;
  score?: number;
  permalink?: string;
  replies?: { data?: { children?: RedditCommentData[] } } | string;
}

function extractComments(
  children: RedditCommentData[],
  subreddit: string,
  out: RedditComment[],
  maxDepth = 2,
  depth = 0
) {
  if (depth > maxDepth || out.length >= 10) return;
  for (const child of children) {
    if (out.length >= 10) break;
    const body = child.body?.trim();
    if (!body || body === "[deleted]" || body === "[removed]" || body.length < 20) continue;
    out.push({
      author: child.author || "[deleted]",
      body: body.slice(0, 400),
      subreddit: child.subreddit || subreddit,
      upvotes: child.ups ?? child.score ?? 0,
      avatarUrl: null,
      permalink: child.permalink
        ? `https://www.reddit.com${child.permalink}`
        : `https://www.reddit.com/r/${subreddit}`,
    });
    if (child.replies && typeof child.replies === "object" && child.replies.data?.children) {
      extractComments(child.replies.data.children as RedditCommentData[], subreddit, out, maxDepth, depth + 1);
    }
  }
}

async function fetchCommentsFromRedditDirect(threadUrl: string): Promise<RedditComment[] | null> {
  try {
    const jsonUrl = threadUrl.replace(/\/?$/, ".json") + "?limit=25&sort=top";
    const res = await fetch(jsonUrl, {
      headers: { "User-Agent": "Picksy/1.0 (electronics recommendation app)" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null; // null = blocked, try Tavily

    const data = await res.json();
    if (!Array.isArray(data) || data.length < 2) return null;

    const subredditMatch = threadUrl.match(/reddit\.com\/r\/([^/]+)/);
    const subreddit = subredditMatch ? subredditMatch[1] : "reddit";
    const children: RedditCommentData[] = (data[1]?.data?.children || []).map(
      (c: { data: RedditCommentData }) => c.data
    );
    const comments: RedditComment[] = [];
    extractComments(children, subreddit, comments);
    return comments.length > 0 ? comments : null;
  } catch {
    return null;
  }
}

// ─── Tavily Extract (reliable from Vercel IPs) ────────────────────────────────

function parseCommentsFromRaw(raw: string, threadUrl: string): RedditComment[] {
  const subredditMatch = threadUrl.match(/reddit\.com\/r\/([^/]+)/);
  const subreddit = subredditMatch ? subredditMatch[1] : "reddit";

  const comments: RedditComment[] = [];
  // Match every u/username occurrence and grab the text that follows
  // Split on u/username boundaries to extract author + following text
  const chunks = raw.split(/\bu\/([A-Za-z0-9_-]{3,20})\b/);
  // chunks: [before_first, author1, text1, author2, text2, ...]

  for (let i = 1; i < chunks.length - 1; i += 2) {
    const author = chunks[i];
    const rawBody = chunks[i + 1]
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 400);

    if (
      rawBody.length < 20 ||
      author === "AutoModerator" ||
      author === "deleted"
    ) continue;

    comments.push({
      author,
      body: rawBody.slice(0, 400),
      subreddit,
      upvotes: 0,
      avatarUrl: null,
      permalink: threadUrl,
    });

    if (comments.length >= 10) break;
  }
  return comments;
}

async function fetchCommentsViaTavily(threadUrls: string[]): Promise<RedditComment[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey || threadUrls.length === 0) return [];

  try {
    const res = await fetch("https://api.tavily.com/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: apiKey, urls: threadUrls }),
      cache: "no-store",
    });
    if (!res.ok) return [];

    const data = await res.json();
    const results: { url: string; raw_content: string }[] = data.results || [];
    return results.flatMap((r) => parseCommentsFromRaw(r.raw_content || "", r.url));
  } catch {
    return [];
  }
}

// ─── Thread discovery fallback ────────────────────────────────────────────────

async function searchRedditForThreads(query: string): Promise<string[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: `${query} site:reddit.com`,
        search_depth: "basic",
        include_domains: ["reddit.com"],
        max_results: 5,
      }),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || [])
      .map((r: { url?: string }) => r.url || "")
      .filter((u: string) => u.includes("/comments/"))
      .slice(0, 3);
  } catch {
    return [];
  }
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const urlsParam = req.nextUrl.searchParams.get("urls");
  const queryParam = req.nextUrl.searchParams.get("query");

  let threadUrls: string[] = [];
  if (urlsParam) {
    try {
      threadUrls = JSON.parse(urlsParam) as string[];
    } catch {
      threadUrls = urlsParam.split(",").map((u) => u.trim()).filter(Boolean);
    }
  }

  if (threadUrls.length === 0 && queryParam) {
    threadUrls = await searchRedditForThreads(queryParam);
  }

  if (threadUrls.length === 0) {
    return NextResponse.json({ comments: [], threadUrls: [] });
  }

  const limited = threadUrls.slice(0, 3);

  // Try Reddit direct API first (fast, structured, works locally)
  const directResults = await Promise.all(limited.map(fetchCommentsFromRedditDirect));
  const directComments = directResults.flatMap((r) => r ?? []);

  // Fall back to Tavily extract for any threads that Reddit blocked
  const blockedUrls = limited.filter((_, i) => directResults[i] === null);
  const tavilyComments = blockedUrls.length > 0
    ? await fetchCommentsViaTavily(blockedUrls)
    : [];

  const allComments = [...directComments, ...tavilyComments];

  const seen = new Set<string>();
  const deduped = allComments.filter((c) => {
    const key = `${c.author}::${c.body.slice(0, 50)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const sorted = deduped.sort((a, b) => b.upvotes - a.upvotes).slice(0, 8);

  // Fetch Reddit avatars for real usernames
  const uniqueAuthors = Array.from(new Set(sorted.slice(0, 5).map((c) => c.author)));
  const avatars = await Promise.all(uniqueAuthors.map(fetchAvatar));
  const avatarMap = new Map(uniqueAuthors.map((author, i) => [author, avatars[i]]));

  const withAvatars = sorted.map((c) => ({
    ...c,
    avatarUrl: avatarMap.get(c.author) ?? null,
  }));

  return NextResponse.json({ comments: withAvatars, threadUrls: limited });
}

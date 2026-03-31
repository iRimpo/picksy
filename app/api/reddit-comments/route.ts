import { NextRequest, NextResponse } from "next/server";

export interface RedditComment {
  author: string;
  body: string;
  subreddit: string;
  upvotes: number;
  avatarUrl: string | null;
  permalink: string;
}

// In-memory avatar cache (cleared on server restart — acceptable for our use)
const avatarCache = new Map<string, string | null>();

async function fetchAvatar(username: string): Promise<string | null> {
  if (username === "[deleted]" || username === "AutoModerator") return null;
  if (avatarCache.has(username)) return avatarCache.get(username)!;

  try {
    const res = await fetch(
      `https://www.reddit.com/user/${encodeURIComponent(username)}/about.json`,
      {
        headers: { "User-Agent": "Picksy/1.0 (electronics recommendation app)" },
        next: { revalidate: 3600 }, // cache 1 hour
      }
    );
    if (!res.ok) {
      avatarCache.set(username, null);
      return null;
    }
    const data = await res.json();
    const icon: string = data?.data?.icon_img || data?.data?.snoovatar_img || "";
    // Reddit appends query params to icon URLs — strip them for cleaner URLs
    const clean = icon ? icon.split("?")[0] : null;
    avatarCache.set(username, clean);
    return clean;
  } catch {
    avatarCache.set(username, null);
    return null;
  }
}

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
      avatarUrl: null, // filled in later
      permalink: child.permalink
        ? `https://www.reddit.com${child.permalink}`
        : `https://www.reddit.com/r/${subreddit}`,
    });

    // Recurse into replies
    if (child.replies && typeof child.replies === "object" && child.replies.data?.children) {
      extractComments(
        child.replies.data.children as RedditCommentData[],
        subreddit,
        out,
        maxDepth,
        depth + 1
      );
    }
  }
}

async function fetchCommentsFromThread(threadUrl: string): Promise<RedditComment[]> {
  // Ensure we use the JSON endpoint
  const jsonUrl = threadUrl.replace(/\/?$/, ".json") + "?limit=25&sort=top";

  try {
    const res = await fetch(jsonUrl, {
      headers: { "User-Agent": "Picksy/1.0 (electronics recommendation app)" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];

    const data = await res.json();
    // Reddit returns [post_listing, comments_listing]
    if (!Array.isArray(data) || data.length < 2) return [];

    const commentsListing = data[1];
    const children: RedditCommentData[] = commentsListing?.data?.children?.map(
      (c: { data: RedditCommentData }) => c.data
    ) || [];

    // Infer subreddit from URL
    const subredditMatch = threadUrl.match(/reddit\.com\/r\/([^/]+)/);
    const subreddit = subredditMatch ? subredditMatch[1] : "reddit";

    const comments: RedditComment[] = [];
    extractComments(children, subreddit, comments);

    return comments;
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const urlsParam = req.nextUrl.searchParams.get("urls");
  if (!urlsParam) {
    return NextResponse.json({ comments: [] });
  }

  let threadUrls: string[];
  try {
    threadUrls = JSON.parse(urlsParam) as string[];
  } catch {
    threadUrls = urlsParam.split(",").map((u) => u.trim()).filter(Boolean);
  }

  // Limit to 3 threads to stay under Reddit rate limits
  const limited = threadUrls.slice(0, 3);

  // Fetch comments from all threads in parallel
  const allCommentArrays = await Promise.all(limited.map(fetchCommentsFromThread));
  const allComments = allCommentArrays.flat();

  // Deduplicate by author+body and sort by upvotes
  const seen = new Set<string>();
  const deduped = allComments.filter((c) => {
    const key = `${c.author}::${c.body.slice(0, 50)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const sorted = deduped.sort((a, b) => b.upvotes - a.upvotes).slice(0, 8);

  // Fetch avatars for unique authors (limit to top 5 to avoid rate limiting)
  const uniqueAuthors = Array.from(new Set(sorted.slice(0, 5).map((c) => c.author)));
  const avatars = await Promise.all(uniqueAuthors.map(fetchAvatar));
  const avatarMap = new Map(uniqueAuthors.map((author, i) => [author, avatars[i]]));

  const withAvatars = sorted.map((c) => ({
    ...c,
    avatarUrl: avatarMap.get(c.author) ?? null,
  }));

  return NextResponse.json({ comments: withAvatars });
}

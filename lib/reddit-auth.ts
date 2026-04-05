/**
 * Reddit OAuth helper — client credentials grant (no user login needed).
 * Tokens are cached in-memory; they last 24h so cold starts get a fresh one.
 *
 * Setup: create a "script" app at reddit.com/prefs/apps, then add to env:
 *   REDDIT_CLIENT_ID     = the ID under the app name
 *   REDDIT_CLIENT_SECRET = the app secret
 */

interface TokenCache {
  token: string;
  expiresAt: number; // epoch ms
}

let cached: TokenCache | null = null;

export async function getRedditToken(): Promise<string | null> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  // Return cached token if still valid (with 5 min buffer)
  if (cached && Date.now() < cached.expiresAt - 5 * 60 * 1000) {
    return cached.token;
  }

  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const res = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "User-Agent": "Picksy/1.0 (electronics recommendation app)",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data?.access_token) return null;

    cached = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in ?? 86400) * 1000,
    };
    return cached.token;
  } catch {
    return null;
  }
}

/** Build headers for authenticated Reddit API calls */
export function redditHeaders(token: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": "Picksy/1.0 (electronics recommendation app)",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

/** Convert a reddit.com URL to oauth.reddit.com when authenticated */
export function redditApiUrl(url: string, token: string | null): string {
  if (!token) return url;
  return url.replace("https://www.reddit.com", "https://oauth.reddit.com");
}

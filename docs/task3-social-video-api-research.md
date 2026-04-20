Task 3 — TikTok & YouTube Integration Research
Picksy Sprint · April 2026


─────────────────────────────────────────────
OVERVIEW
─────────────────────────────────────────────

Picksy currently gets its product recommendations by scanning Reddit. The goal of this research is to figure out how to also pull in content from TikTok and YouTube — where creators post real product reviews with millions of views — so our AI has more data to work with when picking a winner.

TikTok is already partially connected to Picksy. YouTube is not yet connected but is the next recommended step.


─────────────────────────────────────────────
PART 1 — TIKTOK
─────────────────────────────────────────────

WHERE WE ARE NOW

TikTok is already live in the app. When someone searches for a product, Picksy automatically:
  1. Searches TikTok for review videos about that product
  2. Pulls the top 5 videos (title, likes, views)
  3. Grabs the top comments from the best 2 videos
  4. Sends all of that to the AI alongside Reddit data

This is done through a third-party tool called Apify, which acts as a middleman to access TikTok since TikTok doesn't give direct access to outside apps.

If TikTok data fails to load for any reason, the app keeps working normally — it just uses Reddit only.


THE OPTIONS WE LOOKED AT

Option 1 — Apify (what we're currently using)
  What it is: A paid service that scrapes TikTok on our behalf
  Cost: Free tier gives about $5/month in credits. Each search costs roughly $0.05–$0.15, so about 30–100 searches per month for free
  Speed: Slow — takes 15 to 40 seconds per search
  Reliability: Medium — it can break when TikTok updates its app
  Verdict: Good enough for a class project. Not a long-term solution.

Option 2 — Official TikTok Developer API
  What it is: TikTok's own official way to share data with outside apps
  Problem: TikTok only approves large companies and media organizations. You have to apply and wait weeks. Individual developers and class projects are almost always rejected.
  Cost: Free if approved
  Verdict: Not realistic for us. Skip.

Option 3 — TikTok Research API
  What it is: A special version of TikTok's API made for academic researchers
  Who can get it: University students and faculty with a .edu email address
  Cost: Free
  Speed: Fast (direct connection, no scraping)
  Reliability: High — it's an official API
  Verdict: This is the best long-term option. If anyone on the team has a .edu email, we should apply. Approval usually takes 1–2 weeks.

Option 4 — RapidAPI (third-party scrapers)
  What it is: A marketplace of unofficial TikTok scraping tools made by outside developers
  Cost: Around $0.001–$0.01 per search. Most have a free tier of 500–1,000 searches/month
  Speed: Faster than Apify — about 3 to 10 seconds
  Reliability: Same risk as Apify — can break when TikTok updates
  Verdict: A good backup if Apify runs out of credits.


TIKTOK COMPARISON TABLE

  Tool                  | Official? | Monthly Free Searches | Speed     | Already Built?
  ----------------------|-----------|-----------------------|-----------|---------------
  Apify (current)       | No        | ~30–100               | 15–40s    | Yes
  TikTok Official API   | Yes       | Unlimited (if approved)| Fast     | No
  TikTok Research API   | Yes       | Unlimited             | Fast      | No
  RapidAPI scrapers     | No        | 500–1,000             | 3–10s     | No


─────────────────────────────────────────────
PART 2 — YOUTUBE
─────────────────────────────────────────────

WHERE WE ARE NOW

YouTube is not connected to Picksy yet. Adding it would give us a third source of product review content alongside Reddit and TikTok. YouTube has the advantage of longer, more detailed reviews with high engagement, which tends to signal stronger product opinions.


THE OPTIONS WE LOOKED AT

Option 1 — YouTube Data API v3 (recommended)
  What it is: Google's official, free API for accessing YouTube data
  Cost: Free for up to 100 searches per day. That's more than enough for a class project.
  Speed: Very fast — under 1 second per search
  Reliability: Very high — Google maintains it and it has been stable for years
  What we can get: Video titles, descriptions, view counts, like counts, and top comments
  Setup time: About 1 hour (create a Google Cloud account, enable the API, get a key)
  Verdict: Clear best choice. Official, fast, free, and easy to set up.

Option 2 — Apify YouTube Scraper
  What it is: Same Apify platform we use for TikTok, but for YouTube
  Cost: Uses the same $5/month Apify credits
  Speed: 10–30 seconds
  Reliability: Lower than the official API
  Verdict: No advantage over the official Google API. Not recommended.


YOUTUBE COMPARISON TABLE

  Tool                  | Official? | Free Searches/Day | Speed   | Already Built?
  ----------------------|-----------|-------------------|---------|---------------
  YouTube Data API v3   | Yes       | 100               | < 1s    | No
  Apify YouTube scraper | No        | ~30–50            | 10–30s  | No


─────────────────────────────────────────────
SUMMARY & RECOMMENDATION
─────────────────────────────────────────────

  Platform  | Recommended Tool          | Status
  ----------|---------------------------|------------------
  TikTok    | Apify (keep for now)      | Already built
  TikTok    | Research API (apply soon) | Pending approval
  YouTube   | YouTube Data API v3       | Build next sprint

The biggest opportunity right now is adding YouTube. It's free, fast, reliable, and adds a high-quality third signal that our AI can use when making recommendations. We estimate it would take 3–4 hours to build.


─────────────────────────────────────────────
RISKS TO BE AWARE OF
─────────────────────────────────────────────

1. TikTok scraper can break: Since Apify is not an official integration, it can stop working whenever TikTok updates its app. When that happens, the app falls back to Reddit-only automatically — but we lose TikTok data silently until someone notices.

2. Apify credits run out fast: At high usage, the $5 free tier goes quickly. If traffic grows, we'd need to upgrade the plan or switch to RapidAPI as a cheaper backup.

3. YouTube daily quota: 100 free searches/day is plenty for now. If the app ever scaled to thousands of daily users, we'd need to upgrade to a paid Google Cloud plan.




═════════════════════════════════════════════
APPENDIX — IMPLEMENTATION PLAN (YouTube Data API v3)
═════════════════════════════════════════════

This section outlines exactly how to add YouTube as a data source in a future sprint.
Estimated time: 3–4 hours. No changes needed to existing TikTok or Reddit code.


STEP 1 — SET UP THE API KEY (30 minutes, one-time)

  1. Go to console.cloud.google.com and sign in with a Google account
  2. Create a new project (call it "Picksy")
  3. In the left menu, go to APIs & Services → Library
  4. Search for "YouTube Data API v3" and click Enable
  5. Go to APIs & Services → Credentials → Create Credentials → API Key
  6. Copy the key and add it to the project:
       - In .env.local: add the line  YOUTUBE_API_KEY=your_key_here
       - In Vercel dashboard: add the same key under Environment Variables


STEP 2 — ADD THE FETCH FUNCTION (1–2 hours)

In the file app/api/analyze/route.ts, add a new function called fetchYouTubeContent.

It will do three things in sequence:
  a) Search YouTube for "{query} review" → get back 5 video IDs
  b) Fetch the details for those videos (title, description, views, likes)
  c) Optionally fetch the top comments from the best video

The function should return an empty array if the API key is missing or if anything goes wrong — same pattern as the existing TikTok function.

Here is the structure of the API calls:

  Search videos:
  GET https://www.googleapis.com/youtube/v3/search
    ?q="{query} review"
    &type=video
    &maxResults=5
    &key={YOUTUBE_API_KEY}

  Get video details (views, likes, description):
  GET https://www.googleapis.com/youtube/v3/videos
    ?id={comma-separated video IDs}
    &part=snippet,statistics
    &key={YOUTUBE_API_KEY}

  Get top comments (optional):
  GET https://www.googleapis.com/youtube/v3/commentThreads
    ?videoId={id}
    &maxResults=8
    &order=relevance
    &key={YOUTUBE_API_KEY}


STEP 3 — RUN IT IN PARALLEL WITH TIKTOK (30 minutes)

The app already fetches TikTok and Reddit comments at the same time using Promise.all. YouTube plugs right into that same pattern.

Current code (line ~840 in route.ts):
  const [directComments, tiktokVideos] = await Promise.all([
    fetchActualRedditComments(threadUrls),
    fetchTikTokContent(query),
  ]);

Updated code:
  const [directComments, tiktokVideos, youtubeVideos] = await Promise.all([
    fetchActualRedditComments(threadUrls),
    fetchTikTokContent(query),
    fetchYouTubeContent(query),
  ]);

Because all three run at the same time, adding YouTube does not slow down the app.


STEP 4 — ADD TO THE AI PROMPT (30 minutes)

In the analyzeWithGemini function, add a YouTube block to the Gemini prompt, similar to the existing TikTok block:

  YOUTUBE REVIEW CONTENT (creator videos — medium signal):
  [1] "{video title}" by {channel name} ({views} views, {likes} likes): {description}
  [2] ...

Label it as medium priority — same level as TikTok, below actual Reddit comments.


STEP 5 — ADD TO THE API RESPONSE (15 minutes)

In the meta section of the response, add:
  youtubeResults: youtubeVideos.length

This lets the frontend know how many YouTube videos were found, same as tiktokResults today.


STEP 6 — TEST

  1. Run npm run dev
  2. Search for "best noise cancelling headphones"
  3. Check the Network tab → /api/analyze response
  4. Confirm meta.youtubeResults is greater than 0
  5. Confirm the AI recommendation mentions YouTube signals in the summary
  6. Remove YOUTUBE_API_KEY from .env.local and confirm the app still works (falls back to Reddit + TikTok only)
  7. Run npm run build — confirm no TypeScript errors

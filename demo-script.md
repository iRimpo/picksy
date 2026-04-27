# Picksy — 3-Minute Demo Script

> **Format:** One sentence per slide. Everything else you say is in your own voice.
> **Timing:** ~15–18 seconds per slide. Keep moving.
> **Live demo:** Happens on Slide 5. Have picksy.app open in a separate tab before you start.

---

## Slide 1 — Purpose *(green, mascot)*

**Say the one sentence on screen:**
> "We'll tell you what to buy."

**Then add:**
"You know that feeling — you need to buy something, and you end up spending hours going through Reddit threads, TikTok videos, YouTube reviews, and you still don't know what to pick? That's the problem. That's what Picksy solves."

---

## Slide 2 — Problem *(dark, chaos viz)*

**Say the one sentence on screen:**
> "Buying anything means drowning in a sea of conflicting opinions."

**Then add:**
"I wanted to buy a camera. I'm broke, so I did my research — found a TikTok with 2 million views saying it's the best camera of 2026. I'm sold. Then the next video autoplays: 'do NOT buy this camera, it literally ruined my life.' Same product. So I go to Reddit — 400 comments, half of them arguing, a few that look like ads, a top comment from 2023. An hour later, I'm more confused than when I started. That's not a me problem. That's the problem."

*(Point at the 🤯 emoji and the 'no clear answer' circle.)*

---

## Slide 3 — Solution *(green, pipeline viz)*

**Say the one sentence on screen:**
> "Picksy reads the internet and gives you one clear winner."

**Then add:**
"Picksy scans all three sources. An AI weights the sentiment, detects paid shills, scores every product. In about ten seconds you get one pick — not a ranked list of fifty. One. With evidence."

*(Trace the flow left to right with your hand.)*

---

## Slide 4 — Why Now *(dark, three tiles)*

**Say the one sentence on screen:**
> "Three forces are making Picksy inevitable right now."

**Then add:**
*(Point to each tile as you go.)*
"LLMs can now read Reddit slang and sarcasm — that wasn't possible two years ago. Gen Z already shops via community — 78% check Reddit or TikTok before they check Amazon. And trust in paid reviews is dead. Wirecutter, Amazon star ratings — people have stopped believing them. We built for this exact moment."

---

## Slide 5 — Product *(cream, LIVE DEMO)*

**Say the one sentence on screen:**
> "From question to confidence in under 10 seconds."

**Then do the live demo:**
1. Switch to the picksy.app tab.
2. Type a real query — ideally something you personally want to buy.
3. If it goes to the Refine flow, answer the 3 quick questions.
4. Show the winner card. Point to the score, the Reddit quote, the buy buttons.
5. Say: "One pick. Backed by 247 Reddit posts, 83 TikToks, 41 YouTube reviews. No sponsored placement."

---

## Slide 6 — Market Size *(dark, concentric circles)*

**Say the one sentence on screen:**
> "The consumer purchase decision market is massive and broken."

**Then add:**
*(Point to circles from outside in.)*
"Total addressable market — $500 billion in US e-commerce affiliate. We're focused on consumer tech and home goods, a $42 billion slice. Year three, 1% of that is $420 million. And the unlock is sitting right there — 160 million Reddit users are already asking buy questions every day. We just make the answer visible."

---

## Slide 7 — Business Model *(cream, three streams)*

**Say the one sentence on screen:**
> "Every 'Buy' click Picksy drives is a revenue event."

**Then add:**
"Three phases. Phase one — affiliate commissions. 1 to 8 percent on every purchase we drive. Average order $180, average rate 3 percent — $5.40 per buy-click. Phase two is Picksy Pro, seven dollars a month, for power users who want price alerts and saved picks. Phase three is selling the community intelligence back to brands. But we start with affiliate — it's live today."

---

## Slide 8 — Traction *(dark, checklist)*

**Say the one sentence on screen:**
> "We shipped a full product in weeks, not months."

**Then add:**
"Five people. Full pipeline — Reddit, TikTok, YouTube scraping. AI scoring, bias detection. Live store prices. Rate limiting, caching, analytics. 100-plus categories. It's live right now at picksy.app. Not a prototype — a product."

*(Scan the checklist quickly. Don't dwell.)*

---

## Slide 9 — Competitors *(dark, comparison grid)*

**Say the one sentence on screen:**
> "No one else gives you a single community-backed pick."

**Then add:**
"Wirecutter gives you one pick — but a journalist decided, not your community. Google Shopping shows prices, no recommendation. ChatGPT guesses with no sourcing. Reddit has the signal, but it takes you three hours to find it manually. We're the only place all three columns are green."

---

## Slide 10 — Team *(green, team cards)*

**Say the one sentence on screen:**
> "A 5-person team that ships fast and thinks in community."

**Then add:**
"UC Berkeley. We built this in weeks because we use it ourselves. Every feature we added was something we were frustrated by first. That tight feedback loop is why the product is this far along."

*(Gesture briefly at the cards — don't read roles out loud.)*

---

## Slide 11 — Ask *(dark, two numbered boxes)*

**Say the one sentence on screen:**
> "Help us turn one clear pick into the default way people shop."

**Then say the two asks clearly and stop:**
"We have two asks.

One — affiliate introductions. One warm intro to an affiliate program manager at Amazon, Best Buy, or Target. We don't need a deal on day one — just a door open. That's the unlock for our first revenue stream.

Two — strategic mentorship. Someone who has scaled a community-to-commerce product. Our moat is trust — we want guidance on protecting it while we grow fast."

**Then stop. Open the room.**

---

### API Cost Talking Points *(say if asked, or weave in if the topic comes up)*

- **Reddit:** Free right now. Free tier = 100 requests/minute, ~10K requests/month — plenty for our current scale. Non-commercial use is free. If we ever commercialize at scale, Reddit charges $12,000/year minimum — no mid-tier, it's zero or $12K. The question isn't "can we afford it now" — we can't access it commercially yet. The question is whether the model proves out before we need it.
- **YouTube:** Completely free via Data API v3 — 10,000 units/day quota, covers ~100 searches/day.
- **TikTok:** No public API exists. We use Apify (third-party scraper) at roughly $60/month.
- **LLM analysis:** Currently on Gemini's free tier — $0/month, using their largest available model. If we hit the free limit and need to pay: Gemini 1.5 Flash is $0.075 per million input tokens — about $0.004 per search at our ~50K token queries. Less than half a cent per search. Significantly cheaper than Claude or GPT-4. Scaling the LLM is not a cost bottleneck.
- **Total right now:** ~$60/month (just the TikTok scraping). Reddit and LLM are both free at our current scale.

---

## Timing Reference

| Slide | Title | Target Time |
|-------|-------|-------------|
| 1 | Purpose | 0:00 – 0:15 |
| 2 | Problem | 0:15 – 0:35 |
| 3 | Solution | 0:35 – 0:55 |
| 4 | Why Now | 0:55 – 1:15 |
| 5 | Product (DEMO) | 1:15 – 2:00 |
| 6 | Market Size | 2:00 – 2:15 |
| 7 | Business Model | 2:15 – 2:30 |
| 8 | Traction | 2:30 – 2:42 |
| 9 | Competitors | 2:42 – 2:52 |
| 10 | Team | 2:52 – 2:58 |
| 11 | Ask | 2:58 – 3:00 → Q&A |

---

## Key phrases to hit

- *"Not a list of 50. One pick."*
- *"Reddit, TikTok, YouTube — Picksy reads all three."*
- *"Backed by real community evidence, not paid placement."*
- *"Ten seconds versus two to three hours."*
- *"It's live right now."*

## What NOT to say

- Don't say "like Google" or "replacing search" — Picksy replaces the social source-diving, not search.
- Don't apologize for anything in the demo.
- Don't read the slide — the slide is visual, your voice is the story.

/**
 * Picksy Analytics
 * ─────────────────
 * Thin wrapper around Supabase that tracks product events.
 * Rules:
 *   - Never throws — analytics must never break the app
 *   - Silently no-ops during SSR
 *   - Silently no-ops when env vars are missing
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (!_client) _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _client;
}

/** Stable session ID for the current browser tab (resets on tab close) */
function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = sessionStorage.getItem("picksy_sid");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("picksy_sid", id);
  }
  return id;
}

/** Stable visitor ID that persists across sessions */
function getVisitorId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("picksy_vid");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("picksy_vid", id);
  }
  return id;
}

// ─── Event Types ──────────────────────────────────────────────────────────────

export type EventType =
  /** User lands on a page */
  | "page_view"
  /** User leaves a page (captures dwell time) */
  | "page_exit"
  /** ⭐ NORTH STAR — user clicks a "Buy at X" store link */
  | "buy_click"
  /** User submits a search query */
  | "search_submitted"
  /** Results page finishes loading with a winner */
  | "search_result_viewed"
  /** User clicks a category card on the search page */
  | "category_click"
  /** User toggles a skin type, concern, or budget filter */
  | "filter_applied"
  /** User expands the "Other Options" alternatives panel */
  | "alternatives_expanded"
  /** User is redirected to /refine (vague query) */
  | "refine_started"
  /** User completes /refine and navigates to results */
  | "refine_completed"
  /** User navigates from results to a product detail page */
  | "product_detail_viewed";

// ─── Track ────────────────────────────────────────────────────────────────────

export interface TrackPayload {
  page?: string;
  /** The search query that initiated this flow */
  query?: string;
  /** Product name when event relates to a specific product */
  product_name?: string;
  /** Retailer / store when event relates to purchasing */
  store_name?: string;
  /** Price shown at time of event */
  price?: number;
  /** Picksy score (0–100) of the product */
  score?: number;
  /** Time spent on page in ms (page_exit events) */
  dwell_ms?: number;
  /** Anything else you want to store */
  properties?: Record<string, unknown>;
}

export async function track(
  event_type: EventType,
  payload: TrackPayload = {}
): Promise<void> {
  const client = getClient();
  if (!client) return;

  try {
    await client.from("analytics_events").insert({
      session_id: getSessionId(),
      visitor_id: getVisitorId(),
      event_type,
      page: payload.page ?? null,
      query: payload.query ?? null,
      product_name: payload.product_name ?? null,
      store_name: payload.store_name ?? null,
      price: payload.price ?? null,
      score: payload.score ?? null,
      dwell_ms: payload.dwell_ms ?? null,
      properties: payload.properties ?? null,
    });
  } catch {
    // Swallow — analytics must never crash the product
  }
}

-- ─────────────────────────────────────────────────────────────────────────────
-- Picksy Analytics — Event Store
-- Run this once in the Supabase SQL editor (or via supabase db push).
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists analytics_events (
  id           uuid        primary key default gen_random_uuid(),
  created_at   timestamptz not null    default now(),

  -- Who
  session_id   text        not null,   -- browser tab lifetime (sessionStorage)
  visitor_id   text,                   -- cross-session device ID (localStorage)

  -- What
  event_type   text        not null,   -- see EventType union in lib/analytics.ts
  page         text,                   -- page slug: 'search' | 'results' | 'product_detail' | …

  -- Core funnel fields (denormalized for fast GROUP BY queries)
  query        text,                   -- the search query that started this flow
  product_name text,                   -- product involved in the event
  store_name   text,                   -- retailer involved (buy_click)
  price        numeric(10,2),          -- price shown at event time
  score        integer,                -- Picksy score 0–100

  -- ⭐ North Star support
  dwell_ms     integer,                -- ms spent on page (page_exit events)

  -- Overflow bag for event-specific fields
  properties   jsonb
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

-- Fast filter by event type (most common WHERE clause)
create index if not exists idx_ae_event_type
  on analytics_events (event_type);

-- Time-series queries (daily/weekly charts)
create index if not exists idx_ae_created_at
  on analytics_events (created_at desc);

-- Funnel analysis: all events for a session
create index if not exists idx_ae_session_id
  on analytics_events (session_id);

-- Top-query leaderboard
create index if not exists idx_ae_query
  on analytics_events (query)
  where query is not null;

-- Buy-click analysis by product
create index if not exists idx_ae_product_name
  on analytics_events (product_name)
  where product_name is not null;

-- ─── Row-Level Security ───────────────────────────────────────────────────────

alter table analytics_events enable row level security;

-- Anyone (anonymous browser) can INSERT events
create policy "anon_insert"
  on analytics_events
  for insert
  to anon
  with check (true);

-- Only authenticated users (your dashboard/service role) can SELECT
create policy "auth_select"
  on analytics_events
  for select
  to authenticated
  using (true);

-- ─── Helpful Views ────────────────────────────────────────────────────────────

-- Daily buy-click count (North Star chart)
create or replace view v_daily_buy_clicks as
select
  date_trunc('day', created_at) as day,
  count(*)                       as buy_clicks,
  count(distinct session_id)     as unique_sessions
from analytics_events
where event_type = 'buy_click'
group by 1
order by 1 desc;

-- Search-to-buy funnel per day
create or replace view v_daily_funnel as
select
  date_trunc('day', created_at) as day,
  count(*) filter (where event_type = 'search_submitted')    as searches,
  count(*) filter (where event_type = 'search_result_viewed') as results_viewed,
  count(*) filter (where event_type = 'buy_click')           as buy_clicks,
  round(
    100.0 *
    count(*) filter (where event_type = 'buy_click') /
    nullif(count(*) filter (where event_type = 'search_submitted'), 0),
    1
  ) as search_to_buy_pct
from analytics_events
group by 1
order by 1 desc;

-- Top queries by volume
create or replace view v_top_queries as
select
  query,
  count(*)                                             as searches,
  count(*) filter (where event_type = 'buy_click')    as buy_clicks,
  round(avg(score))                                    as avg_score
from analytics_events
where query is not null
group by query
order by searches desc;

-- Average dwell time per page
create or replace view v_avg_dwell_by_page as
select
  page,
  round(avg(dwell_ms) / 1000.0, 1) as avg_dwell_seconds,
  count(*)                           as exits
from analytics_events
where event_type = 'page_exit'
  and dwell_ms is not null
group by page
order by avg_dwell_seconds desc;

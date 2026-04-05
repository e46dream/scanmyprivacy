-- ============================================================
-- Supabase SQL — run this in your Supabase SQL editor
-- ============================================================

create table scan_jobs (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz default now(),
  started_at    timestamptz,
  completed_at  timestamptz,

  user_id       uuid references auth.users(id) on delete set null,
  user_email    text not null,
  target_url    text not null,

  status        text not null default 'pending'
                check (status in ('pending','scanning','complete','failed')),

  payment_id    text unique,         -- Stripe payment_intent id
  amount_paid   integer,             -- in pence/cents

  scan_results  jsonb,               -- full scanner output
  pdf_path      text,                -- Supabase Storage path
  download_url  text,                -- presigned URL (refreshed on GET)
  error         text                 -- error message if failed
);

-- Index for user dashboard queries
create index on scan_jobs (user_id, created_at desc);
create index on scan_jobs (user_email, created_at desc);
create index on scan_jobs (status);

-- Row Level Security — users can only see their own jobs
alter table scan_jobs enable row level security;

create policy "Users see own jobs"
  on scan_jobs for select
  using (auth.uid() = user_id);

-- Service role (used by API server) bypasses RLS
-- No policy needed — SUPABASE_SERVICE_KEY has full access

-- Storage bucket for PDF reports
insert into storage.buckets (id, name, public)
values ('reports', 'reports', false);

-- Only authenticated users can download their own reports
create policy "Users download own reports"
  on storage.objects for select
  using (
    bucket_id = 'reports' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

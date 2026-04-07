-- ============================================================
-- Minimal Supabase Data API Setup
-- ============================================================

-- Enable RLS on scan_jobs table
alter table scan_jobs enable row level security;

-- Users can only see their own scan jobs
create policy "Users see own jobs" on scan_jobs
for select using (auth.uid() = user_id);

-- Service role has full access (for API server)
create policy "Service role full access" on scan_jobs
for all using (current_user = 'service_role');

-- Create indexes for better performance
create index idx_scan_jobs_user_status on scan_jobs(user_id, status);
create index idx_scan_jobs_created_at on scan_jobs(created_at desc);

-- Public view for scan status (no sensitive data)
create or replace view public_scan_status as
select 
  id,
  status,
  created_at,
  started_at,
  completed_at
from scan_jobs
where status in ('complete', 'failed');

-- Grant access to public view
grant select on public_scan_status to anon, authenticated;
grant select on public_scan_status to service_role;

-- Grant service role full access to public schema
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;

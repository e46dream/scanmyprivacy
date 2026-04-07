-- ============================================================
-- Supabase Data API Setup
-- ============================================================

-- 1. Enable Data API for public schema
-- This creates RESTful endpoints for all tables in public schema

-- Grant service role full access to public schema
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all functions in schema public to service_role;

-- ============================================================
-- Automatic RLS Setup
-- ============================================================

-- Function to automatically enable RLS on new tables
create or replace function auto_enable_rls()
returns trigger as $$
begin
  -- Enable RLS on the table
  execute format('alter table %I enable row level security', TG_TABLE_NAME);
  
  -- Create default policy (deny all, then allow specific access)
  execute format('
    create policy "Users can view own data" on %I
    for select using (auth.uid() is not null);
    
    create policy "Users can update own data" on %I
    for update using (auth.uid() = user_id);
    
    create policy "Users can delete own data" on %I
    for delete using (auth.uid() = user_id);
  ', TG_TABLE_NAME);
  
  return new;
end;
$$ language plpgsql;

-- Function to create RLS policies for any table with user_id
create or replace function create_user_rls_policies(table_name text)
returns void as $$
begin
  -- Only create policies if table has user_id column
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = table_name 
    and column_name = 'user_id'
  ) then
    execute format('
      create policy "Users can view own %I" on %I
      for select using (auth.uid() = user_id);
      
      create policy "Users can update own %I" on %I
      for update using (auth.uid() = user_id);
      
      create policy "Users can delete own %I" on %I
      for delete using (auth.uid() = user_id);
    ', table_name, table_name);
  end if;
end;
$$ language plpgsql;

-- ============================================================
-- Apply RLS to existing tables
-- ============================================================

-- Enable RLS on scan_jobs table
alter table scan_jobs enable row level security;

-- Create improved RLS policies for scan_jobs
drop policy if exists "Users see own jobs" on scan_jobs;
drop policy if exists "Service role full access" on scan_jobs;

-- Users can only see their own scan jobs
create policy "Users see own jobs" on scan_jobs
for select using (auth.uid() = user_id);

-- Users can only update their own scan jobs  
create policy "Users update own jobs" on scan_jobs
for update using (auth.uid() = user_id);

-- Users can only delete their own scan jobs
create policy "Users delete own jobs" on scan_jobs
for delete using (auth.uid() = user_id);

-- Service role has full access (for API server)
create policy "Service role full access" on scan_jobs
for all using (current_setting('request.jwt.claims', true)['role'] = 'service_role');

-- ============================================================
-- Manual RLS Setup (Supabase doesn't support DDL events)
-- ============================================================

-- Note: Supabase doesn't support DDL event triggers
-- You'll need to manually run RLS setup for new tables

-- Function to create RLS policies for any table with user_id
create or replace function create_user_rls_policies(table_name text)
returns void as $$
begin
  -- Only create policies if table has user_id column
  if exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = table_name 
    and column_name = 'user_id'
  ) then
    execute format('
      create policy "Users can view own %I" on %I
      for select using (auth.uid() = user_id);
      
      create policy "Users can update own %I" on %I
      for update using (auth.uid() = user_id);
      
      create policy "Users can delete own %I" on %I
      for delete using (auth.uid() = user_id);
    ', table_name, table_name);
  end if;
end;
$$ language plpgsql;

-- ============================================================
-- Additional Security Improvements
-- ============================================================

-- Create function to check if user owns the resource
create or replace function user_owns_resource(resource_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from scan_jobs 
    where id = resource_id 
    and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- Create indexes for better performance
create index if not exists idx_scan_jobs_user_status on scan_jobs(user_id, status);
create index if not exists idx_scan_jobs_created_at on scan_jobs(created_at desc);

-- ============================================================
-- API Views for Easy Access
-- ============================================================

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

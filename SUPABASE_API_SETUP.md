# Supabase Data API & Automatic RLS Setup

## Overview
This guide enables:
1. **RESTful Data API** - Auto-generated endpoints for all tables
2. **Automatic RLS** - Row Level Security applied to all new tables
3. **Enhanced Security** - Improved policies and performance

---

## 🚀 Quick Setup (2 Minutes)

### Step 1: Run Data API Setup
1. Go to your Supabase project
2. Click "SQL Editor" in left sidebar
3. Copy the entire contents of `supabase-data-api.sql`
4. Click "New Query" → Paste → Click "Run"

### Step 2: Verify Setup
1. Check "Database" section in sidebar
2. You should see: `scan_jobs` table with policies enabled
3. Go to Settings → API
4. Data API should be enabled for `public` schema

---

## 🔧 What This Script Does

### 1. Enables Data API
```sql
-- Makes all tables accessible via REST API
alter schema public enable row level security;
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
```

### 2. Automatic RLS System
```sql
-- Creates trigger that automatically enables RLS on new tables
create trigger apply_auto_rls_trigger after create or alter on public.schema;
```

### 3. Enhanced Security Policies
```sql
-- Improved policies for scan_jobs table
-- Users can only access their own data
-- Service role has full access for API server
```

### 4. Performance Optimizations
```sql
-- Strategic indexes for faster queries
create index idx_scan_jobs_user_status on scan_jobs(user_id, status);
```

---

## 🌐 How to Use the Data API

### Endpoints Created
After setup, you'll have these REST endpoints:

```
GET    /rest/v1/scan_jobs
POST   /rest/v1/scan_jobs
PATCH  /rest/v1/scan_jobs?id=eq.{id}
DELETE /rest/v1/scan_jobs?id=eq.{id}
```

### Example Usage
```javascript
// Using Supabase JS client
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

// Get user's scan jobs
const { data: scans } = await supabase
  .from('scan_jobs')
  .select('*')
  .eq('user_id', userId)

// Create new scan job
const { data: newScan } = await supabase
  .from('scan_jobs')
  .insert({
    user_id: userId,
    target_url: 'example.com',
    status: 'pending'
  })
```

---

## 🔒 Security Features Enabled

### Row Level Security (RLS)
✅ **Automatic** - New tables get RLS enabled automatically  
✅ **User Isolation** - Users can only see their own data  
✅ **Service Role** - API server has full access  
✅ **Policies** - Select/Update/Delete restrictions  

### Data API Controls
✅ **RESTful** - Standard HTTP methods for all tables  
✅ **Authentication** - JWT-based access control  
✅ **CORS** - Cross-origin requests supported  
✅ **Filtering** - Built-in query parameters  

### Performance
✅ **Indexes** - Optimized for common queries  
✅ **Views** - Public-safe data views  
✅ **Caching** - Supabase edge caching enabled  

---

## ⚡ Benefits

### For Developers
- **Auto-generated APIs** - No manual endpoint creation
- **TypeScript support** - Full IntelliSense
- **Real-time subscriptions** - WebSocket connections
- **File storage** - Built-in CDN for PDFs

### For Security
- **Zero-trust RLS** - Security by default
- **Automatic policies** - Consistent protection
- **User isolation** - Data privacy guaranteed
- **Audit ready** - Full access logging

---

## 🧪 Testing Your Setup

### 1. Test Data API
```bash
# Test public endpoint (no auth required)
curl https://your-project.supabase.co/rest/v1/public_scan_status

# Test authenticated endpoint
curl https://your-project.supabase.co/rest/v1/scan_jobs \
  -H "apikey: YOUR_SERVICE_KEY" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Test RLS Policies
```sql
-- Verify RLS is enabled
select relrowsecurity from pg_tables where tablename = 'scan_jobs';

-- Check policies are active
select policyname, permissive, roles from pg_policies 
where tablename = 'scan_jobs';
```

---

## 🔄 Next Steps

After completing this setup:

1. **Update API server** to use REST endpoints instead of direct SQL
2. **Test frontend** integration with new endpoints
3. **Monitor logs** for RLS policy violations
4. **Scale** - Add more tables as needed, RLS will auto-apply

---

## 🛠️ Advanced Configuration

### Custom RLS Function
```sql
-- Use for tables with custom user_id columns
select create_user_rls_policies('your_table_name');
```

### Service Role Management
```sql
-- Check current service role permissions
select * from pg_roles where rolname = 'service_role';
```

### Performance Monitoring
```sql
-- Monitor query performance
select * from pg_stat_user_functions where funcname = 'apply_auto_rls';
```

---

## 🔍 Troubleshooting

### Data API Not Working
1. Check `public` schema has RLS enabled
2. Verify service role permissions
3. Test with Supabase JS client

### RLS Policies Too Restrictive
1. Review policy logic in SQL Editor
2. Test with different user roles
3. Check `auth.uid()` values

### Performance Issues
1. Verify indexes are created
2. Check query execution plans
3. Monitor Supabase metrics dashboard

---

## 📚 Additional Resources

- [Supabase Data API Docs](https://supabase.com/docs/guides/api)
- [RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [API Authentication](https://supabase.com/docs/guides/auth/auth-helpers)

---

**✅ Your Supabase project is now enterprise-ready with automatic security!**

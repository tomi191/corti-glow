---
name: db-migration
description: Create a Supabase database migration - new tables, columns, indexes, RLS policies, or schema changes
argument-hint: [description-of-change]
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Write, Bash(ls:*)
---

# Create Database Migration

Migration for: **$ARGUMENTS**

## Before Creating:

1. **Read the current schema:**
   - `supabase/migrations/001_initial_schema.sql` - Base schema
   - Any other migration files in `supabase/migrations/`

2. **Read Supabase types:**
   - `src/lib/supabase/types.ts` - Current TypeScript types

3. **Check what code uses the affected tables:**
   - Grep for table name in `src/lib/actions/`
   - Grep for table name in `src/app/api/`

## Current Schema (tables):
- `products` - Product catalog with JSONB variants
- `orders` - Customer orders with JSONB items & shipping
- `discounts` - Promotional codes
- `econt_cities` - Cached Econt city data
- `econt_offices` - Cached Econt office locations

## Migration Template:

Create file: `supabase/migrations/NNN_<description>.sql`

```sql
-- Migration: <description>
-- Date: <today>

-- 1. Schema changes
ALTER TABLE <table> ADD COLUMN <column> <type> <constraints>;

-- OR create new table
CREATE TABLE <table_name> (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- columns...
);

-- 2. ALWAYS enable RLS on new tables
ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;

-- 3. ALWAYS add RLS policies
-- Public read (if needed)
CREATE POLICY "anon_read_<table>" ON <table_name>
FOR SELECT USING (<condition>);

-- Service role full access
CREATE POLICY "service_full_<table>" ON <table_name>
FOR ALL USING (true);

-- 4. Add indexes for frequently queried columns
CREATE INDEX idx_<table>_<column> ON <table_name>(<column>);

-- 5. Add updated_at trigger (if using updated_at)
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON <table_name>
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

## After Creating Migration:

1. **Update TypeScript types** in `src/lib/supabase/types.ts` to reflect new schema
2. **Update any affected:**
   - Server actions in `src/lib/actions/`
   - API routes in `src/app/api/`
   - TypeScript interfaces in `src/types/index.ts`
3. **Verify** with `npm run build`

## Checklist:
- [ ] RLS enabled on ALL new tables
- [ ] RLS policies defined (anon read + service role full)
- [ ] Indexes added for queried columns
- [ ] JSONB used for flexible/nested data
- [ ] UUID primary keys (not serial)
- [ ] `created_at` and `updated_at` timestamps included
- [ ] TypeScript types updated
- [ ] No breaking changes to existing queries

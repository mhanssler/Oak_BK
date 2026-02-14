# Supabase Setup

1. Create a Supabase project.
2. In SQL Editor, run:
   - `supabase/migrations/202602140001_initial_schema.sql`
3. In Authentication settings:
   - Enable email confirmations.
   - Enforce minimum password strength.
   - Enable MFA policies for admin/staff users.
4. In API settings, use only:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Keep service role key out of client code and out of git.

# Oak_BK Bankruptcy Intake Platform

Secure, account-driven bankruptcy intake application for attorney-guided trustee packet preparation.

## Core Capabilities
- Secure Supabase authentication (email/password).
- Protected dashboard with case lifecycle (`draft` -> `submitted`).
- Guided multi-step intake questionnaire with required-field gatekeeping.
- Structured case packet review and JSON export.
- Supabase schema + RLS policies + audit event logging.
- Repository-level secret protection via mandatory tracked and history scans.

## Tech Stack
- Next.js 13 App Router (TypeScript)
- Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- Vercel deployment target

## Setup
1. Copy `.env.example` to `.env.local`.
2. Add your Supabase project URL and anon key.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run database migration SQL in order:
   - `supabase/migrations/202602140001_initial_schema.sql`
   - `supabase/migrations/202602140002_case_ref_admin_access.sql`
5. Start app:
   ```bash
   npm run dev
   ```

## Admin Account Setup
- Admin authorization checks `app_metadata.role = "admin"` (not user-editable metadata).
- Set admin role with Supabase Auth Admin API or SQL:
  ```sql
  update auth.users
  set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
  where email = 'admin@example.com';
  ```
- Ask the admin user to sign out/in after role changes so JWT claims refresh.

## Security Workflow (Required)
Run these before PR/merge:

```bash
npm run security:scan:tracked
npm run security:scan:history
```

Or run both:

```bash
npm run security:scan
```

## Deployment Notes (Vercel + Supabase)
1. Add production environment variables in Vercel:
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Configure custom domain (`hansslerlaw.com`) in Vercel once staging is validated.
3. Enforce HTTPS, MFA for admins, and Supabase email confirmation.
4. Keep service-role keys out of Vercel project env unless required by server-only jobs.

## Compliance Baseline
- `AGENTS.md` contains secret-safety and SOX-style controls.
- `.gitignore` blocks env files and common private key material.
- Audit table captures key case events.
- RLS policies restrict case data access to case owner or authorized admin role.

## Current Limitation
The local `Reference/Requirements..gdoc` file is a cloud placeholder and is not readable from this environment. Export that document as `.md` or `.txt` into the repo to map attorney language directly into final questionnaire wording and trustee packet format.


## Hamish Intake API
Use the server-only Hamish intake route when OpenClaw needs to create or update bankruptcy intake records from a phone or chat conversation.

Required server environment variables:
- `SUPABASE_SERVICE_ROLE_KEY`
- `HAMISH_API_TOKEN`
- `HAMISH_CASE_OWNER_USER_ID`

Route contract:
- `GET /api/hamish/intake`
  - Requires `Authorization: Bearer <HAMISH_API_TOKEN>`
  - Returns questionnaire steps and operator guidance for Hamish
- `POST /api/hamish/intake`
  - Requires `Authorization: Bearer <HAMISH_API_TOKEN>`
  - Creates or resolves a case and upserts one questionnaire step into Supabase

Design notes:
- Hamish is an office intake professional, not a lawyer.
- The route is server-only and intended for Vercel deployment.
- Cases created by Hamish are owned by the configured office/admin user so staff can review them immediately in the secure admin UI.
- All writes are validated against the existing questionnaire schema and logged in `case_audit_events`.
- `GET /api/hamish/intake` now also returns a structured behavior profile, question hints, and a ready-to-use system prompt for OpenClaw.
- See `docs/hamish-agent-behavior.md` for the human-readable behavior contract.

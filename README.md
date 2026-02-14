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
4. Run database migration SQL from `supabase/migrations/202602140001_initial_schema.sql` in Supabase SQL editor.
5. Start app:
   ```bash
   npm run dev
   ```

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
- RLS policies restrict all data access to authenticated owner.

## Current Limitation
The local `Reference/Requirements..gdoc` file is a cloud placeholder and is not readable from this environment. Export that document as `.md` or `.txt` into the repo to map attorney language directly into final questionnaire wording and trustee packet format.

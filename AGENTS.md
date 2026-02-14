# AGENTS.md

## Purpose
This repository processes bankruptcy intake data and must be operated as a high-sensitivity legal system.
All contributors and AI agents must prioritize confidentiality, integrity, traceability, and least privilege.

## Secret-Safety Non-Negotiables
1. Treat any key/token/password-like value as compromised unless it is an obvious placeholder.
2. Never output, echo, or quote secret values from `.env*`, key files, command output, CI logs, or history.
3. Never commit concrete key-like defaults in tracked files; placeholders only.
4. Before declaring a branch clean, run both:
   - `npm run security:scan:tracked`
   - `npm run security:scan:history`
5. If any real secret is found or was previously committed:
   - Rotate/revoke immediately.
   - Scrub current files and git history.
   - Re-run both scans and verify clean results.
6. Never claim "clean" unless scans pass and ignore protections are verified.
7. Keep `.gitignore` protections for:
   - `.env*` (except explicit example files)
   - Private key/cert patterns (`*.pem`, `*.key`, `*.p8`, `*.p12`, `*.pfx`, `*.crt`, `*.cer`, `*.der`, `*.csr`, `*.jks`)
8. If a secret is posted in chat/issues/tickets, instruct immediate rotation and do not repeat the value.

## SOX-Style Operational Controls
1. Use least privilege for Supabase roles and API keys.
2. Enforce RLS on all client-accessible tables.
3. Keep immutable audit events for case-level create/update/submit actions.
4. Require pull requests and review for schema/security/policy changes.
5. Track environment variable changes through approved deployment controls only.
6. Maintain segregation between production and non-production projects.
7. Keep a repeatable release checklist and rollback procedure.
8. Require MFA on admin/operator accounts.
9. Restrict log payloads so they do not contain PII or secrets.
10. Encrypt data in transit and at rest; do not bypass TLS.

## Data Handling Rules
1. Assume all client data is confidential legal data.
2. Collect only required data fields for bankruptcy preparation.
3. Avoid writing client PII to application logs.
4. Avoid using production data in local/dev environments.
5. Minimize retained exports and remove stale copies on a defined schedule.

## Engineering Rules
1. Prefer server-side data access and validation for intake writes.
2. Keep validation deterministic and auditable.
3. Security headers, session refresh, and auth checks are mandatory for protected routes.
4. Add tests for security-sensitive paths before production rollout.

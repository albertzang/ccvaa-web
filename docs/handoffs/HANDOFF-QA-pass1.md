# Handoff: Developer / PM → QA

**Date:** 2026-07-14  
**Pass:** `1`  
**Backlog work ID:** `members-0001`  
**Ship path that led here:** `feature-branch`  
**Epic branch:** `feat/members`  
**Merge gate:** `epic`  
**Filled by:** Developer  

**Save as:** `docs/handoffs/HANDOFF-QA-pass1.md`

**Branch name:** `feat/members`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/8  
**Commit:** `9bae70b`  
**Preview URL:** https://ccvaa-web-git-feat-members-azang-projects.vercel.app  
**Preview protection:** QA reads `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local` (do **not** paste the secret here). See `docs/protocols/PREVIEW_PROTECTION.md`.  
**Production URL:** https://ccvaa-web.vercel.app/ (Pass **2** only — not for this pass)

**Post-merge cleanup (Pass 2 only):** n/a until **merge milestone**

**Out of scope for QA:** https://ccvaa.ca/ — CEO manual only.

## What changed

Platform-only ticket (no public UI): Neon + Drizzle schema for orthogonal newsletter/membership, OTP challenges, unsub tokens, shared Zod, migrate/seed scripts, fail-closed DB access.

## Focus checklist

- [ ] `GET /api/members/health` on Preview returns **503** with `MEMBERS_ENV_MISSING` when `DATABASE_URL` is unset (expected on Preview until CEO sets Vercel Preview env)
- [ ] With `DATABASE_URL` configured locally: `npm run db:migrate` and `npm run db:seed` succeed; seed Annual member has anniversary `2025-03-15`
- [ ] `npm run lint` + `npm run typecheck` clean (CI on PR)
- [ ] No public UI, Stripe Checkout, Resend send, or admin roster changes
- [ ] Existing `/admin` mail-session auth still works on Preview (optional smoke)

## Known risks / flaky areas

- Preview will fail-closed on `/api/members/health` until CEO sets `DATABASE_URL` in Vercel Preview env (Neon branch recommended).
- Migrate/seed require local `.env.local` with `DATABASE_URL` — not run automatically on deploy.

## Preview env notes (Pass 1)

- `DATABASE_URL` not yet required for site build; health endpoint documents missing env explicitly.
- Admin mail auth needs Deployment Protection bypass if testing `/admin`.

## Production / baseline / Pass 2 auth notes

- Admin auth = Hover mailbox login in Mail iframe — see `docs/protocols/QA_AUTH.md`
- QA reads `ADMIN_EMAIL` / `ADMIN_PASS` from `.env.local` — **do not** paste into handoffs or reports

## Report back with

`docs/reports/QA-pass1.md` — Pass 1 result for **continue epic** (do **not** merge to `main`).

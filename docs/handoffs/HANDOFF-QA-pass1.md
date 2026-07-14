# Handoff: Developer / PM → QA

**Date:** 2026-07-14  
**Pass:** `1`  
**Backlog work ID:** `members-0003`  
**Ship path that led here:** `feature-branch`  
**Epic branch:** `feat/members`  
**Merge gate:** `epic`  
**Filled by:** Developer  

**Save as:** `docs/handoffs/HANDOFF-QA-pass1.md`

**Branch name:** `feat/members`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/8  
**Commit:** `8fb76ba`  
**Preview URL:** https://ccvaa-web-git-feat-members-azang-projects.vercel.app  
**Preview protection:** QA reads `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local` (do **not** paste the secret here). See `docs/protocols/PREVIEW_PROTECTION.md`.  
**Production URL:** https://ccvaa-web.vercel.app/ (Pass **2** only — not for this pass)

**Post-merge cleanup (Pass 2 only):** n/a until **merge milestone**

**Out of scope for QA:** https://ccvaa.ca/ — CEO manual only.

## Environments to test this pass

- [ ] Dev — http://localhost:3000/ (optional)
- [ ] Preview — https://ccvaa-web-git-feat-members-azang-projects.vercel.app (required)
- [ ] Production — n/a for this pass

## What changed

**members-0003 Iteration 2** — fail-closed newsletter/API errors when Resend or schema is missing:

- Subscribe / confirm / preference map missing Resend / `MembersEnvError` / DB-unavailable / unmigrated schema to clear **503** (not generic **500** `MEMBERS_INTERNAL_ERROR`)
- Subscribe checks Resend before DB write → `MEMBERS_EMAIL_UNAVAILABLE` **503**
- Preference `lookup` remains DB-only (no Resend required when schema is present)
- Shared `handleMembersApiError` + OTP/join DB wrappers aligned so join OTP routes do not regress the same 500

## Focus checklist

- [ ] `GET /api/members/health` still **200** with `email.resend: "missing"` (and `db.ok` as before)
- [ ] With `DATABASE_URL` set and `RESEND_*` missing: `POST /api/members/newsletter/subscribe` → **503** with clear code (`MEMBERS_EMAIL_UNAVAILABLE` or `MEMBERS_ENV_MISSING`), not **500** / “Something went wrong…”
- [ ] Same env: `POST /api/members/newsletter/preference` with `{"action":"lookup","email":"qa-pass1@example.com"}` → **200** if schema migrated, or clear **503** `MEMBERS_DB_UNAVAILABLE` if unmigrated — never generic **500**
- [ ] Confirm route with missing Resend (and no valid OTP) still fail-closed clearly (400 OTP / 503 env-db as applicable) — no blank 500
- [ ] Hero Subscribe → `#contact` and Contact newsletter UI still load
- [ ] Invalid `/?unsub=bad-token#contact` still shows invalid/expired message
- [ ] `npm run lint` + `typecheck` clean (CI on PR)
- [ ] **Do not merge** (epic merge gate)

## Known risks / flaky areas

- Full double opt-in + Mailosaur still blocked until CEO sets Preview `RESEND_*` (and optional seed)
- Browser `fetch` needs deployment-protection bypass cookie (`x-vercel-set-bypass-cookie=true`) — query-only bypass is enough for curl
- Tip may race with in-flight `members-0005` OTP login WIP on the same epic branch — this retest is **only** the fail-closed Iteration 2 delta

## Preview env notes (Pass 1)

Admin mail auth needs Preview Deployment Protection bypass if testing `/admin` on Preview (mailbox login in iframe).

## Report back with

`docs/templates/qa-report.md` → overwrite `docs/reports/QA-pass1.md`  
Sign-off: **continue epic** / **hold** / **retest** (not merge to `main`)

# Handoff: Developer / PM → QA

**Date:** 2026-07-10  
**Pass:** `1`  
**Backlog work ID:** `admin-console-0007`  
**Ship path that led here:** `feature-branch`  
**Filled by:** Developer  

**Branch name:** `fix/otp-verify-shared-store`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/2  
**Commit:** `f0dd5d8`  
**Preview URL:** https://ccvaa-web-git-fix-otp-verify-shared-store-azang-projects.vercel.app  
**Preview protection:** QA reads `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local` (do **not** paste the secret in this file). See `docs/protocols/PREVIEW_PROTECTION.md`.  
**Production URL:** https://ccvaa-web.vercel.app/ (Pass **2** and **baseline**)  

**Post-merge cleanup (Pass 2 only):**  
- [ ] Feature branch deleted **locally**  
- [ ] Feature branch deleted **on origin** (or n/a for `direct-to-main`)  
Cleanup happens **right after merge**, before Pass 2 testing — see `docs/protocols/GIT_DEPLOY.md`.  
**Baseline:** cleanup n/a (no feature branch for this pass).

**Out of scope for QA:** https://ccvaa.ca/ — CEO manual only (DNS/cache). Do not test or block on it.

## How QA gets the Preview URL (Pass 1 only)

1. Developer creates the branch and opens the PR.
2. Vercel posts the Preview deployment URL on the PR.
3. Developer pastes that URL into **Preview URL** above.
4. QA tests **only** that pasted URL. If blank on Pass 1 → block and ask Developer/PM.
5. **Protection bypass:** Load `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local`; open  
   `<Preview URL>?x-vercel-protection-bypass=<secret>`. If empty → block (CEO fills `.env.local`). Never write the secret into reports.  
   See `docs/protocols/PREVIEW_PROTECTION.md`.

## Environments to test this pass

- [ ] Dev — http://localhost:3000/ (optional on Pass 1 only)
- [x] Preview — https://ccvaa-web-git-fix-otp-verify-shared-store-azang-projects.vercel.app (required on Pass 1)
- [ ] Production — https://ccvaa-web.vercel.app/ (required on Pass 2 and **baseline**)

## What changed

Fix admin-console-0007: admin OTP verify failed on Production with “No active code found” because challenges lived in a per-instance in-memory `Map`. OTP challenges and rate-limit buckets now use **Upstash Redis** when `KV_REST_API_URL` + `KV_REST_API_TOKEN` are set (shared across Vercel instances). In-memory fallback remains for local `next dev` only.

## Focus checklist

- [ ] Desktop `/admin`: **Send login code** → email arrives → enter code → **Verify and sign in** succeeds (session cookie; scaffolds visible)
- [ ] Wrong code → clear invalid error; after max attempts → locked message
- [ ] Expired / no-challenge path still clear (request a new one)
- [ ] Cooldown / rate-limit still apply after repeated sends
- [ ] No secrets (OTP codes, Redis tokens) in UI errors

## Known risks / flaky areas

- **Preview/Production must have Redis REST env vars** (`KV_REST_API_URL` + `KV_REST_API_TOKEN`). Without them, Preview falls back to in-memory and the original cross-instance bug can still appear. If verify fails with “No active code found” on Preview, first confirm Redis/KV is linked for the **Preview** environment, then redeploy.
- **Preview Deployment Protection:** without `VERCEL_AUTOMATION_BYPASS_SECRET` in `.env.local`, QA hits Vercel login wall — see `docs/protocols/PREVIEW_PROTECTION.md`.
- OTP readout: **single-Send** + CEO-in-the-loop (`docs/protocols/QA_AUTH.md`).

## Preview env notes (Pass 1)

Required for this fix to be testable on Preview (same as Production before merge):

- `KV_REST_API_URL` + `KV_REST_API_TOKEN` (Vercel Marketplace Upstash Redis inject)

Plus existing admin mail/OTP vars (`ADMIN_SESSION_SECRET`, SMTP_*, `ADMIN_OTP_DEV_MODE=false`, etc.).

Provision: Vercel Marketplace → Upstash Redis for **Preview** and **Production**, then redeploy if vars were added after this Preview built.

## Production / baseline / Pass 2 auth notes

- OTP emailed to `info@ccvaa.ca` (or `ADMIN_OTP_EMAIL`). **Do not commit codes.**
- **OTP readout (current standard):** **single-Send** + CEO-in-the-loop — see `docs/protocols/QA_AUTH.md`. QA Sends **once** → CEO pastes newest code → QA verifies **once**. No extra Sends.
- If CEO unavailable: test request UI/cooldown/errors; mark full login/scaffolds **blocked** (not automatic product fail) unless handoff says otherwise.
- Never give QA standing mailbox passwords.

## How Developer validated (pre-QA)

- Root cause matches per-instance `Map` in `src/lib/admin/otp.ts` (same class as FEATURES.md note).
- Implementation: Redis-backed challenge + rate-limit store with TTL; routes await async APIs.
- `npm run lint` and `npm run typecheck` passed.
- Cross-instance behavior cannot be fully proven without Redis on Preview; QA Pass 1 on Preview **with Redis configured** is the acceptance proof.

## Report back with

`docs/templates/qa-report.md` (Bugs found → PM backlog triage)  
- Pass 1: **merge** / **hold** / **retest**  
- Pass 2: **ship confirmed** / **hotfix**  
- Baseline: **baseline confirmed** / **issues found**

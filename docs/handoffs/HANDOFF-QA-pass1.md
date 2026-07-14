# Handoff: Developer / PM → QA

**Date:** 2026-07-14  
**Pass:** `1`  
**Backlog work ID:** `members-0003` (then `members-0005` same Preview — see Part B)  
**Ship path that led here:** `feature-branch`  
**Epic branch:** `feat/members`  
**Merge gate:** `epic`  
**Filled by:** Product Manager  

**Save as:** `docs/handoffs/HANDOFF-QA-pass1.md`

**Branch name:** `feat/members`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/8  
**Commit:** tip of `feat/members` (expect ≥ `31ca4cc`)  
**Preview URL:** https://ccvaa-web-git-feat-members-azang-projects.vercel.app  
**Preview protection:** QA reads `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local` (do **not** paste the secret here). See `docs/protocols/PREVIEW_PROTECTION.md`.  
**Production URL:** https://ccvaa-web.vercel.app/ (Pass **2** only — not for this pass)

**Post-merge cleanup (Pass 2 only):** n/a until **merge milestone**

**Out of scope for QA:** https://ccvaa.ca/ — CEO manual only.

## Environments to test this pass

- [ ] Dev — http://localhost:3000/ (optional)
- [ ] Preview — https://ccvaa-web-git-feat-members-azang-projects.vercel.app (required)
- [ ] Production — n/a for this pass

## Preview env notes (CEO confirmed)

`GET /api/members/health` now: `db.ok: true`, `email.resend: "configured"`, `session: "configured"`. Schema migrated + seed applied. Stripe still missing (Join live Checkout out of scope for this pass).

Browser forms need bypass **cookie** (`x-vercel-set-bypass-cookie=true`).

---

## Part A — `members-0003` (Iteration 2 retest + live Resend)

### What changed

Fail-closed 503 when Resend missing (Iteration 2) plus **live** newsletter paths now that Resend + DB are on Preview.

### Focus checklist

- [ ] Health: resend configured (sanity)
- [ ] `POST …/newsletter/subscribe` with valid email → success path (OTP sent via Resend), not 500/503
- [ ] Confirm OTP flow if capturable (Inbox / Resend dashboard logs / Mailosaur if configured); else note blocked with evidence of send accepted
- [ ] Preference `lookup` for known/seed email returns clear result (not generic 500)
- [ ] Hero Subscribe → `#contact`; invalid `/?unsub=bad-token#contact` still invalid/expired
- [ ] Spot-check: if you temporarily cannot prove fail-closed without unsetting env, rely on prior Iteration 2 fix evidence + live path green
- [ ] Lint/typecheck clean if feasible
- [ ] Sign-off Part A: **continue epic** / **hold** / **retest** — **do not merge**

Write Part A into `docs/reports/QA-pass1.md` first (work ID `members-0003`), commit/push, then continue Part B.

---

## Part B — `members-0005` (OTP login)

After Part A is signed **continue epic**, overwrite report for **`members-0005`** (or append a clearly separated Part B section then overwrite per template with work ID `members-0005` — prefer overwrite with full 0005 report after 0003 continue epic is recorded in backlog by noting in Overall).

### Focus checklist

- [ ] `#membership` Member sign-in + Join when logged out
- [ ] Seeded active member (`*@ccvaa-seed.test` or documented seed): start → OTP email → verify → signed-in stub (email/plan)
- [ ] Logout clears session; `/admin` still not opened by member cookie
- [ ] Newsletter-only / non-member: clear not-eligible
- [ ] Fail-closed spot-check not required to unset secrets; health already shows configured
- [ ] Sign-off: **continue epic** / **hold** / **retest** — **do not merge**

### Known risks

- OTP capture: Resend dashboard / CEO inbox if seed email is real domain; seed `@ccvaa-seed.test` may need Mailosaur or Resend logs — document blocked if uncapturable
- Stripe Join live still blocked (`stripe: "missing"`)

## Report back with

`docs/templates/qa-report.md` → overwrite `docs/reports/QA-pass1.md`  
Epic sign-off only (**continue epic** / **hold** / **retest**). Commit + push on `feat/members`. Never commit secrets.

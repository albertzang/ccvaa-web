# Handoff: Developer / PM → QA

**Date:**  
**Pass:** `1` | `2` | `baseline`  
**Ship path that led here:** `feature-branch` | `direct-to-main` | `n/a` (baseline)  
**Filled by:** Developer (Pass 1 Preview URL) / PM (baseline) / either (Pass 2)  

**Branch name:** (n/a for baseline or direct-to-main)  
**PR link:** (n/a for baseline or direct-to-main)  
**Commit:** (optional for baseline — note `main` tip if known)  
**Preview URL:** (Pass **1** only — **required**; paste exact URL from Vercel / GitHub PR — do not reconstruct)  
**Preview protection:** Option B — QA reads `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local` (do **not** paste the secret here). See `docs/protocols/PREVIEW_PROTECTION.md`.  
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
5. **Protection bypass:** Before navigating, QA loads `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local` and opens  
   `<Preview URL>?x-vercel-protection-bypass=<secret>` (or `&…` if query already present).  
   If the secret is empty/missing → **block** and ask CEO to fill `.env.local`. Never write the secret into this handoff or the QA report.  
   Details: `docs/protocols/PREVIEW_PROTECTION.md`.

## Environments to test this pass

- [ ] Dev — http://localhost:3000/ (optional on Pass 1 only)
- [ ] Preview — _(must match Preview URL field)_ (required on Pass 1)
- [ ] Production — https://ccvaa-web.vercel.app/ (required on Pass 2 and **baseline**)

## What changed

(For **baseline:** “Audit already-on-main features per FEATURES.md” — no new PR.)

## Focus checklist

- [ ]
- [ ]

## Known risks / flaky areas

## Preview env notes (Pass 1)

Admin OTP/mail need Vercel **Preview** env vars if testing auth on Preview.

## Production / baseline / Pass 2 auth notes

- OTP emailed to `info@ccvaa.ca` (or `ADMIN_OTP_EMAIL`). **Do not commit codes.**
- **OTP readout (current standard):** CEO-in-the-loop — see `docs/protocols/QA_AUTH.md`. QA triggers Send; CEO pastes the code into the QA chat for that session only.
- If CEO unavailable: test request UI/cooldown/errors; mark full login/scaffolds **blocked** (not automatic product fail) unless handoff says otherwise.
- Never give QA standing mailbox passwords.

## Report back with

`docs/templates/qa-report.md` + bugs via `docs/templates/bug-report.md`  
- Pass 1: **merge** / **hold** / **retest**  
- Pass 2: **ship confirmed** / **hotfix**  
- Baseline: **baseline confirmed** / **issues found**

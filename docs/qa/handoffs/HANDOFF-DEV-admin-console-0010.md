# Handoff: Product Manager → Developer

**Date:** 2026-07-12  
**Requested by:** CEO / PM  
**Backlog work ID:** `admin-console-0010` (**required**)  
**Backlog link:** `docs/product/backlogs/admin-console-BACKLOG.md`  
**Priority:** now  
**Iteration:** `1`

**Save as:** `docs/qa/handoffs/HANDOFF-DEV-admin-console-0010.md`  
**Rework:** overwrite this path on later Iterations.

## Verifier & Ship path

**Verifier:** `ceo`  
**Verify passes:** `pass1`  
**Ship path:** `feature-branch`

**CEO approved direct-to-main?** no — feature branch required  
**CEO Pass 2:** **skip** (Verify passes = `pass1` only)

### Implications

- Create `feat/admin-console-0010-…` from latest `main`; open PR; record **exact Preview URL** for CEO (no agent QA files)
- After CEO Preview verify → CEO/PM ask merge → delete branch; **do not** kick agent Pass 2
- Iterations: keep same branch/PR when possible; overwrite this handoff

## Goal

Admin console authentication is **Hover webmail session inside the mail iframe**. Log in to mail ⇒ admin logged in; log out of mail ⇒ admin logged out. **Remove OTP** end-to-end (code + docs/ops that exist only for OTP).

## User value

One sign-in (mailbox) instead of OTP + mail; less SMTP/Redis/OTP ops burden.

## Acceptance criteria

- [ ] OTP request/verify UI gone from `/admin`
- [ ] OTP API routes / libs / session-cookie-from-OTP flow removed or replaced; no dead imports
- [ ] Authenticated chrome + scaffolds appear when mailbox is logged in inside the iframe
- [ ] Logged-out chrome when mailbox is logged out / session missing
- [ ] Header Log out behavior is coherent with mail logout (implement one clear model)
- [ ] Mobile unsupported gate still works
- [ ] Mail iframe + proxy still work (do not regress `admin-console-0009` embed fixes: CSRF header, hash-link guard, hide `#header`)
- [ ] `.env.example`, `FEATURES.md`, and OTP-centric protocol/skill notes updated so agents/CEO are not told to use OTP for admin login
- [ ] Preview ready; paste exact Preview URL for CEO Pass 1; **no** `HANDOFF-QA-*`

## Out of scope

- Real Members / Financial / Events features
- New mail provider
- Pass 2 / Production verify (CEO skips per Verify passes)
- Keeping OTP as fallback

## Technical hints

- Today: `AdminPage` uses `/api/admin/session` + OTP (`LoginSection`, `src/lib/admin/otp.ts`, `src/app/api/admin/otp/*`, `src/lib/admin/session.ts`, Redis rate limits)
- Mail: same-origin iframe `/admin/mail` — parent **can** observe proxied responses/cookies more easily than a cross-origin embed; design a reliable “mail session present?” signal (cookie presence, lightweight probe endpoint, injected page script + `postMessage`, etc.)
- Prefer fail-closed: if mail session cannot be determined, treat as logged out
- Prune: `ADMIN_OTP_*`, SMTP-only-for-OTP, `ADMIN_SESSION_SECRET` if unused, KV/Redis if only used for OTP — leave a short note in PR for CEO to delete unused Vercel env after merge
- Related FEATURES.md: Admin login (OTP) + Mail sections
- Institutional notes: `.cursor/skills/ccvaa-dev-memory/SKILL.md`, `docs/protocols/QA_AUTH.md` (OTP readout) — update or mark obsolete for admin login

## Design / UX constraints

Keep coastal admin chrome; Mail section remains the natural place to sign in. Avoid adding a second parallel login form.

## Git / deploy expectations

### Ship path = `feature-branch` + CEO Pass 1 only

- Branch: `feat/admin-console-0010-hover-auth` (or similar; include work ID)
- PR title includes `admin-console-0010`
- Wait for Vercel Preview; give PM/CEO the **exact Preview URL**
- Merge only when CEO asks after Preview verify
- Delete feature branch after merge; **skip Pass 2**

## Done means (Iteration)

- Lint/typecheck clean; PR + Preview URL ready for CEO
- Summarize auth model + what was pruned
- Ready for CEO Pass 1; backlog stays `in-progress` until CEO **verified** (may iterate)

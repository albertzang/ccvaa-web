# Handoff: Developer / PM → QA

**Date:** 2026-07-17  
**Pass:** `1`  
**Backlog work ID:** `members-0023`  
**Ship path that led here:** `feature-branch`  
**Epic branch:** `feat/members`  
**Merge gate:** `epic`  
**Filled by:** Developer  
**Iteration:** `1`

**Save as:** `docs/handoffs/HANDOFF-QA-pass1.md`

**Branch name:** `feat/members`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/8  
**Implementation commit:** `061160a`  
**Preview URL:** https://ccvaa-r3syu9ogc-azang-projects.vercel.app  
**Preview deployment:** `dpl_AKoBNs7ieEbpvnGkBYasLeLpYazK`  
**Preview protection:** use both `x-vercel-protection-bypass` and `x-vercel-set-bypass-cookie=true` from `.env.local`; never paste the secret.

**Out of scope:** Production flag changes · https://ccvaa.ca/ · merge to `main` · Events feature · gating webhooks/unsubscribe/admin · ESP Production go-live.

## Environments to test this pass

- [ ] Dev — http://localhost:3000/ (optional)
- [ ] Preview — https://ccvaa-r3syu9ogc-azang-projects.vercel.app (required)
- [ ] Production — n/a (Pass 1; agents must never flip Production flags)

## Preview flag setup and operation

At handoff time, `npx vercel env ls preview` showed all four switch variables still pending:

- `EDGE_CONFIG` — read connection string
- `EDGE_CONFIG_ID` — Preview store ID
- `VERCEL_API_TOKEN` — write-capable token
- `VERCEL_TEAM_ID` — team scope (optional in code, expected for this team)

The current Preview therefore intentionally fails closed to **Members Off**. After the CEO adds the Preview-scoped values, a new Preview deployment is required so that deployment receives them. Preview must use a store separate from Production.

After env is available:

1. Sign into Hover webmail through Preview `/admin`, then open **Members**.
2. Read the current flag from the **Members on public site** control. Off is the default for missing/non-boolean/read-error values.
3. Click the control to write **On** or **Off**. It calls authenticated `PATCH /api/admin/feature-flags/members` with `{"enabled":true|false}`; refresh/read uses authenticated `GET /api/admin/feature-flags/members`.
4. Allow up to about 10 seconds, then refresh the homepage and retry a gated API.
5. Restore the Preview flag to **Off** after testing unless the CEO/PM asks to leave it On.

Do not call the write API without the authenticated admin mail session. Never expose the Vercel token or Edge Config connection string.

## What changed

- Generic typed slug-keyed flag helpers under `src/lib/flags/`: fail-closed Edge Config read and Vercel REST API upsert.
- Generic mail-session-authenticated + Zod-validated admin flag route and reusable switch UI.
- Members Off hides the Membership nav link, Hero Subscribe/Join CTAs and badges, and the full `#membership` portal.
- Members Off returns stable `404` JSON from public user-initiated member APIs:
  `{"ok":false,"code":"MEMBERS_FEATURE_UNAVAILABLE","message":"The members feature is not available."}`
- Always live: Stripe webhook, unsubscribe redeem/landing, member logout/health, admin roster/switch, and future `/api/members/esp/*` hooks.
- Unsubscribe landing still renders a minimal confirmation while Members is Off.

## Focus checklist

### Off (test first and restore last)
- [ ] Homepage 200: no Membership nav link, no `#membership` portal, no Hero Subscribe/Join CTAs or count badges; About and Contact remain balanced.
- [ ] `POST /api/members/verify/start` and representative preference/join/profile requests return the stable `404` body above.
- [ ] Stripe webhook route is not switch-blocked (a malformed unsigned probe may return its own 400).
- [ ] Invalid `/?unsub=<token>` still lands on a minimal invalid/expired confirmation; valid seed unsubscribe still redeems and leaves paid membership unchanged.
- [ ] `/admin` Members roster and flag control remain available.

### On
- [ ] After propagation, homepage matches members-0022: Membership nav/portal + Hero CTAs/counters.
- [ ] Verify OTP, newsletter preference, Join plans/checkout, and profile APIs are no longer switch-blocked and preserve prior behavior.
- [ ] Flip On→Off reflects without a code redeploy after the propagation window.

### Security and resilience
- [ ] Unauthenticated GET/PATCH of `/api/admin/feature-flags/members` returns admin-auth required.
- [ ] Invalid slug/body is rejected; no secret appears in browser responses or logs.
- [ ] Missing Edge Config env does not crash build/homepage and remains Off.

## Known risks / blockers

- **Blocker for On/write testing:** Preview Edge Config env was not configured when this handoff was written. CEO must add it and trigger/redeploy Preview.
- Resend/Mailosaur and Stripe test-mode timing remain existing live-flow risks.

## Report back with

Save `docs/templates/qa-report.md` as `docs/reports/QA-pass1.md`.

Pass 1 (Merge gate `epic`): **continue epic** / **hold** / **retest**. Do not merge.

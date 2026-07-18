# Handoff: Developer / PM → QA

**Date:** 2026-07-17  
**Pass:** `1`  
**Backlog work ID:** `members-0023`  
**Ship path that led here:** `feature-branch`  
**Epic branch:** `feat/members`  
**Merge gate:** `epic`  
**Filled by:** Developer  
**Iteration:** `2`

**Save as:** `docs/handoffs/HANDOFF-QA-pass1.md`

**Branch name:** `feat/members`  
**PR link:** https://github.com/albertzang/ccvaa-web/pull/8  
**Implementation commit:** `47b10e3` (empty trigger commit; feature code unchanged since `86c74c8`)
**Preview URL:** https://ccvaa-5o8uzjx2h-azang-projects.vercel.app
**Preview URL (branch alias, always latest READY):** https://ccvaa-web-git-feat-members-azang-projects.vercel.app
**Preview deployment:** `dpl_GCYqkMn3DvmkKeHDuUmBjKCN6qaM`
**Preview protection:** use both `x-vercel-protection-bypass` and `x-vercel-set-bypass-cookie=true` from `.env.local`; never paste the secret.

> **Redeploy retest (EDGE_CONFIG bake-in).** The previous Preview deploys were built **before** the CEO connected `EDGE_CONFIG`; Vercel captures env at deploy-creation time, so those deploys had no `EDGE_CONFIG` and failed closed to Off even with `preview.members=true`. The deploy above was created **after** `EDGE_CONFIG` was connected (Prod/Preview/Dev), so it now carries `EDGE_CONFIG` and the **On** path is testable. Same Iteration 2 checklist as before — no feature code changed.

**Out of scope:** Production flag changes · https://ccvaa.ca/ · merge to `main` · Events feature · gating webhooks/unsubscribe/admin · in-app flag editor.

## Environments to test this pass

- [ ] Dev — http://localhost:3000/ (optional)
- [ ] Preview — use the exact URL above (required)
- [ ] Production — n/a (Pass 1; agents must never flip Production flags)

## Edge Config setup

The CEO connects the project’s one Edge Config store to all environments so the app receives only `EDGE_CONFIG`. In the Vercel dashboard, Edge Config → Items must contain these three top-level items, each with a JSON object value:

```json
{
  "production": { "members": false },
  "preview": { "members": false },
  "development": { "members": false }
}
```

The dashboard may display these as three item rows named `production`, `preview`, and `development`. Do not create separate stores. Do not add `EDGE_CONFIG_ID`, `VERCEL_API_TOKEN`, or `VERCEL_TEAM_ID` to the app.

## How QA flips the Preview flag

1. Open Vercel dashboard → the connected Edge Config store → **Items**.
2. Edit only the `preview` item’s JSON object.
3. Set `"members": false` for Off or `"members": true` for On, preserving sibling flags if present.
4. Save and allow a short propagation window, then refresh the Preview homepage and retry a gated API. No app redeploy should be needed for a value-only change.
5. At the end of Pass 1, restore `preview.members` to `false`.

Never edit the `production` item. Agents may edit only `preview` for this pass (`development` is allowed only for local Dev testing). Flag changes happen in Vercel, not `/admin`.

## What changed

- One Edge Config store now holds environment buckets keyed by `production`, `preview`, and `development`; each bucket contains generic slug-keyed booleans (`members` first).
- `VERCEL_ENV` selects the bucket; local/unset uses `development`. Missing/unknown environment, bucket, key, non-boolean value, unset `EDGE_CONFIG`, timeout, or read error fails closed to Off.
- The Admin Members flag control, authenticated flag API, and all in-app Edge Config write code were removed.
- Members Off still hides the Membership nav link, Hero Subscribe/Join CTAs and badges, and the full `#membership` portal.
- Members Off still returns stable `404` JSON from public user-initiated member APIs:
  `{"ok":false,"code":"MEMBERS_FEATURE_UNAVAILABLE","message":"The members feature is not available."}`
- Always live: Stripe webhook, unsubscribe redeem/landing, member logout/health, admin roster, and future `/api/members/esp/*` hooks.

## Focus checklist

### Off (test first and restore last)

- [ ] Set `preview.members` false.
- [ ] Homepage 200: no Membership nav link, no `#membership` portal, no Hero Subscribe/Join CTAs or count badges; About and Contact remain balanced.
- [ ] `POST /api/members/verify/start` and representative preference/join/profile requests return the stable `404` body above.
- [ ] Stripe webhook route is not switch-blocked (a malformed unsigned probe may return its own 400).
- [ ] Invalid `/?unsub=<token>` still lands on a minimal invalid/expired confirmation; valid seed unsubscribe still redeems and leaves paid membership unchanged.
- [ ] `/admin` Members roster remains available and has no feature-switch control.

### On

- [ ] Set `preview.members` true.
- [ ] After propagation, homepage matches members-0022: Membership nav/portal + Hero CTAs/counters.
- [ ] Verify OTP, newsletter preference, Join plans/checkout, and profile APIs are no longer switch-blocked and preserve prior behavior.
- [ ] Flip On→Off reflects without a code redeploy.

### Isolation and resilience

- [ ] `preview.members` changes do not require or modify `production.members`.
- [ ] `/api/admin/feature-flags/members` no longer exists.
- [ ] Missing Edge Config env does not crash build/homepage and remains Off.
- [ ] Restore `preview.members` to false after testing.

## Known risks / blockers

- Pass 1 On testing was previously blocked pending `EDGE_CONFIG`; the store is now connected and the Preview deploy above carries `EDGE_CONFIG`, so On is unblocked for this retest.
- QA needs Vercel dashboard access to edit the Preview item.
- Resend/Mailosaur and Stripe test-mode timing remain existing live-flow risks.

## Report back with

Save `docs/templates/qa-report.md` as `docs/reports/QA-pass1.md`.

Pass 1 (Merge gate `epic`): **continue epic** / **hold** / **retest**. Do not merge.

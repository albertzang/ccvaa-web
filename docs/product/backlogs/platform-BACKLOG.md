# Backlog: Platform

**Feature:** Platform  
**Slug:** `platform`  
**Owner:** Product Manager  
**Next ID:** `0002`

Canonical work IDs: `platform-NNNN`. Schema: [`../BACKLOG.md`](../BACKLOG.md).

Hosting, data, and Vercel-platform infrastructure for CCVAA Web (Neon, Edge Config / Flags, env wiring, deploy integrations). Distinct from **`agent-os`** (multi-agent process docs) and product features (`members`, `public-homepage`, `admin-console`).

**Current defaults (living):**
- **DB:** Neon — two branches (`main` → Production; `staging` → shared non-prod: Preview / Staging / local). App uses `DATABASE_URL` only. See `.env.example`.
- **Public feature switches:** Vercel Edge Config (env buckets) — keep until targeting / experiments are needed.

---

## platform-0001 — Evaluate / adopt Vercel Flags (replace or wrap Edge Config)

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `later` |
| **Status** | `not-started` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |

### Description

**Context (CEO 2026-07-29):** Project dashboard **Flags** is available. Today public kill switches (e.g. `members`) use **Edge Config** env buckets (`production` / `preview` / `development`) — simple on/off, fail closed, no Admin UI write path (`members-0023`). PM advice: **stay on Edge Config** until we need targeting, progressive rollout, A/B tests, or Flags Explorer / observability.

**Goal (when kicked off):** Evaluate Vercel Flags vs current Edge Config for CCVAA public switches; if adopting, migrate (or wrap) so go-live / Preview flips stay main-safe and CEO-gated on Production. Prefer minimal rewrite; preserve fail-closed Off defaults and “agents never flip Production.”

**Acceptance (draft — refine at kickoff):**
- [ ] Decision recorded (stay / adopt / hybrid) with rationale
- [ ] If adopt: Members (and future) flags readable via Flags path; Edge Config pruned or documented as storage-only
- [ ] Production / Preview / Development behavior parity with today’s buckets
- [ ] Docs: FEATURES, `.env.example`, GIT_DEPLOY go-live notes updated
- [ ] Pass 1 + Pass 2

**Out of scope (for now):** LaunchDarkly or other Marketplace providers; percentage rollouts / A/B until a product need exists.

### Links

- Source: CEO (2026-07-29)
- Related: `members-0023` (Edge Config Members switch); `members-0009` (Production go-live)
- Docs: [Vercel Flags](https://vercel.com/docs/flags/vercel-flags), [Edge Config](https://vercel.com/docs/edge-config)

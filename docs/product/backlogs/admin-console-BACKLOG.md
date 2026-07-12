# Backlog: Admin Console

**Feature:** Admin Console  
**Slug:** `admin-console`  
**Owner:** Product Manager  
**Next ID:** `0010`  

Canonical work IDs: `admin-console-NNNN`. Schema: [`../BACKLOG.md`](../BACKLOG.md).

---

## admin-console-0009 — Embedded Hover mailbox issues

| Field | Value |
|-------|--------|
| **Type** | `bug` |
| **Priority** | `now` |
| **Status** | `in-progress` |
| **Source** | `ceo` |
| **Verifier** | `ceo` |
| **Verify passes** | `pass2` |
| **Ship path** | `direct-to-main` |

### Description

Umbrella ticket for Hover webmail iframe issues on `/admin` (same-origin proxy `/admin/mail`). Stay `in-progress` until CEO says **verified** on the whole ticket (or drops remaining iterations). Known fragile area: `src/app/admin/mail/[[...path]]/route.ts`, `src/proxy.ts`.

**Environment:** Production — https://ccvaa-web.vercel.app/admin (Mail section)

### Iteration 1 — Inbox refresh HTTP 403 (CEO verified 2026-07-12)

**Summary:** Manual / auto inbox refresh returned HTTP 403 in the console.

**Fix:** Forward `X-Roundcube-Request`; normalize `/admin/mail/?…` trailing-slash AJAX paths. Commit `6001ff1`.

### Iteration 2 — Toolbar More / Mark reloads iframe (current)

**Summary:** With one or more messages selected, toolbar actions such as **More** and **Mark** cause the iframe document to fully refresh/reload, so menus/actions are not usable.

**Steps to reproduce:**
1. Open `/admin` → Mail; sign into Hover in the iframe.
2. Select one or more messages in the list.
3. Click toolbar **More** or **Mark** (and similar selection-dependent toolbar controls).

**Expected:** Dropdown/menu or mark action works inside the iframe without a full iframe navigation/reload.

**Actual:** Iframe content refreshes/reloads; control is unusable.

**Severity:** medium–high for day-to-day mail triage in the embedded UI.

**Hypothesis for Dev:** form/link `target`, top-level navigation, or unre written action URL leaving the iframe / forcing a full document load instead of Roundcube AJAX.

### Links

- Dev: `docs/qa/handoffs/HANDOFF-DEV-admin-console-0009.md`
- Iteration 1 ship: `6001ff1`

---

## admin-console-0008 — Remove admin page intro (CCVAA / Admin blurb)

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `completed` |
| **Verifier** | `ceo` |
| **Verify passes** | `pass2` |
| **Ship path** | `direct-to-main` |

### Description

Remove the page-intro block on `/admin` (“CCVAA” / “Admin” / “Manage mail, members…”). Keep header, Mail, Login, and scaffolds. CEO verifies on Production after push.

CEO verified 2026-07-11 on https://ccvaa-web.vercel.app/admin. Commit: `e38d35b`.

---

## admin-console-0001 — Members list (auth-gated)

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `next` |
| **Status** | `not-started` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |

### Description

Replace the Members “coming soon” scaffold with a real auth-gated members list. Scope TBD with CEO (fields, CRUD vs read-only). Must remain behind admin OTP session.

### Links

- FEATURES.md: Post-auth scaffolds → Members

---

## admin-console-0002 — Financial dashboard (auth-gated)

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `next` |
| **Status** | `not-started` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |

### Description

Replace the Financial dashboard scaffold with a real auth-gated dashboard. Metrics and data source TBD with CEO.

### Links

- FEATURES.md: Post-auth scaffolds → Financial dashboard

---

## admin-console-0003 — Events & posts list + CRUD

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `next` |
| **Status** | `not-started` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |

### Description

Replace Events & posts scaffold with list + CRUD for events/posts, auth-gated. Content model TBD with CEO.

### Links

- FEATURES.md: Post-auth scaffolds → Events & posts

---

## admin-console-0004 — Ensure Preview env covers admin OTP/mail

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `not-started` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |

### Description

Ops/checklist: confirm Vercel **Preview** has the same admin-critical env as Production where needed for Pass 1 (SMTP, `ADMIN_SESSION_SECRET`, `KV_REST_API_*`, etc.). Document gaps in handoffs; CEO sets secrets. Not a product UI change unless missing env causes code/docs fixes.

### Links

- `docs/protocols/GIT_DEPLOY.md`, `QA_AUTH.md`, `PREVIEW_PROTECTION.md`

---

## admin-console-0005 — Dedicated QA test inbox for OTP

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `later` |
| **Status** | `not-started` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |

### Description

Throwaway mailbox for QA OTP (Preview-first `ADMIN_OTP_EMAIL` + Vercel-only secrets). Replace or supplement CEO-in-the-loop readout. Single-Send discipline still applies. See `docs/protocols/QA_AUTH.md`.

### Links

- `docs/protocols/QA_AUTH.md`

---

## admin-console-0006 — Env-aware SMTP/OTP error copy

| Field | Value |
|-------|--------|
| **Type** | `bug` |
| **Priority** | `now` |
| **Status** | `completed` |
| **Source** | `qa` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |

### Description

**Summary:** Production OTP send failed with missing `SMTP_PASS`; error copy incorrectly pointed at `.env.local`. Code fix: environment-aware messaging for Production/Preview. SMTP env set by CEO (ops).

**Environment:** Production — https://ccvaa-web.vercel.app/

**Steps to reproduce (original):**
1. Open `/admin` at desktop width.
2. Click **Send login code**.
3. Observe error under the login form.

**Expected:** OTP emailed, or a clear Production-appropriate config error (Vercel env), not `.env.local`-only wording.

**Actual (pre-fix):** `SMTP_PASS is not set. Add your Hover mailbox password to .env.local…`

**Severity:** high

Shipped: error-copy via PR #1; CEO set Production SMTP.

### Links

- Found in: `docs/qa/reports/QA-baseline-0001.md`
- Dev: `docs/qa/handoffs/HANDOFF-DEV-admin-console-0006.md`
- QA Pass 1: `docs/qa/reports/QA-admin-console-0006-pass1.md`
- QA Pass 2: `docs/qa/reports/QA-admin-console-0006-pass2.md`
- PR: https://github.com/albertzang/ccvaa-web/pull/1

---

## admin-console-0007 — OTP shared store (Redis / KV)

| Field | Value |
|-------|--------|
| **Type** | `bug` |
| **Priority** | `now` |
| **Status** | `completed` |
| **Source** | `ceo` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |

### Description

**Summary:** OTP email delivered on Production, but verify failed with “No active code found. Request a new one.” Per-instance in-memory challenge store.

**Environment:** Production — https://ccvaa-web.vercel.app/

**Steps to reproduce (original):**
1. Open `/admin` at desktop width.
2. **Send login code** — email arrives with 6-digit code.
3. Enter code → **Verify and sign in**.
4. Observe “No active code found…”

**Expected:** Valid unexpired OTP signs in and shows scaffolds.

**Actual:** Verify missing-challenge across Vercel instances.

**Severity:** high

**Fix:** Upstash Redis (`KV_REST_API_*`) for challenges + rate limits. Shipped PR #2; Pass 2 ship confirmed.

### Links

- Dev: `docs/qa/handoffs/HANDOFF-DEV-admin-console-0007.md`
- QA Pass 1: `docs/qa/reports/QA-admin-console-0007-pass1.md`
- QA Pass 2: `docs/qa/reports/QA-admin-console-0007-pass2.md`
- PR: https://github.com/albertzang/ccvaa-web/pull/2

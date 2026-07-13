# Backlog: Admin Console

**Feature:** Admin Console  
**Slug:** `admin-console`  
**Owner:** Product Manager  
**Next ID:** `0011`  

Canonical work IDs: `admin-console-NNNN`. Schema: [`../BACKLOG.md`](../BACKLOG.md).

---

## admin-console-0010 — Auth = Hover mailbox iframe session (prune OTP)

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `in-progress` |
| **Verifier** | `ceo` |
| **Verify passes** | `pass1` |
| **Ship path** | `feature-branch` |

### Description

Change admin console auth so **logging into / out of Hover webmail inside the `/admin` mail iframe** is the sole signal that the admin console is logged in / out. **Prune the entire OTP stack** (UI, APIs, libs, Redis OTP usage for this purpose, env/docs/ops that exist only for OTP).

**Verifier / ship (CEO-specified):** feature branch + Preview; CEO does **Pass 1 only** on Preview; **skip Pass 2** on Production. Expect **multiple Iterations** on the same work ID (overwrite Dev handoff; keep `in-progress` until CEO **verified** for the ticket).

**Goals / acceptance (product):**
- No OTP send/verify UI or APIs required for admin access
- When Hover mailbox is logged in (iframe), console treats user as authenticated (show Members / Financial / Events scaffolds, header Log out / logged-in nav as appropriate)
- When Hover mailbox is logged out (or session ends), console is logged out (hide protected scaffolds; match logged-out chrome)
- Explicit admin “Log out” (if kept) must log out mail session as well, or be replaced by mail logout as the only control — pick the coherent UX; document in handoff notes
- Desktop/tablet gate unchanged
- Docs/protocols/skills that describe OTP admin login updated or removed; `.env.example` and FEATURES.md pruned of OTP-only guidance; Redis/KV may remain only if still needed for something else (today it is OTP/rate-limit — remove if unused)
- SMTP/OTP-related env can be marked removable from Vercel after ship (CEO ops) — code should not require them

**Out of scope (unless CEO expands):**
- Replacing Hover with another mail host
- Building real Members/Financial/Events CRUD
- Keeping a parallel OTP path “just in case”

**Security note:** Admin privilege becomes “whoever can sign into `info@ccvaa.ca` (or configured mailbox) via the embedded webmail.” That matches prior OTP delivery to the same inbox; call out any residual risks in the PR.

### Iteration 1 — Hover mail session auth + prune OTP (CEO verified 2026-07-12)

Pass 1 on Preview (PR #4). Mail iframe session drives admin auth; OTP removed.

### Iteration 2 — Sidebar layout + panel switching (CEO verified 2026-07-12)

Full-height left sidebar + right main panel; one section at a time. PR #4.

### Iteration 3 — Nav labels, strip chrome, keep mail iframe stable (CEO partially verified 2026-07-12)

Sidebar Webmail/Members/Events/Financial, no login banner/titles, iframe kept mounted. **Remaining:** in-iframe navigation still **blinks** (full document flash) vs native Hover.

### Iteration 4 — Smooth in-mail nav + Help in new tab (CEO partially verified 2026-07-12)

Help button works (new tab → Hover help URL). In-iframe nav still problematic.

### Iteration 5 — Task bar must not reload admin shell (attempted; CEO not verified)

Target stripping / task-nav guards shipped (`162d523`). CEO reports **whole admin page still reloads** on task switch.

### Iteration 6 — Fix `rcmail.command('switch-task')` breakout (CEO: still broken)

Patches shipped; CEO still sees whole admin reload. Clarified: problem is **Hover iframe task bar**, not our sidebar.

### Iteration 7 — Frame isolation (CEO corrected diagnosis)

Frame isolation may still help, but CEO clarified the symptom is **not** a full `/admin` reload.

### Iteration 8 — Stop auth blink on in-iframe navigation (CEO verified 2026-07-12)

Sticky auth + quieter AUTH_BRIDGE. Sidebar auth items no longer blink.

### Iteration 9 — Instant in-iframe task switch (no white flash) (current)

**Symptom (CEO):** Significant **white page blink inside the iframe** when navigating Hover task bar (Mail / Files / Calendar / Contacts). Native https://mail.hover.com feels like an **instant switch**.

**Why (likely):** Roundcube `switch-task` does a **full document load**. Through our proxy that means: unload iframe → white empty document → Vercel function → fetch Hover → rewrite HTML → paint. Extra latency vs direct Hover makes the white flash obvious.

**Fix direction (prefer UX over micro-optimizing proxy only):**
1. **Preload-then-swap (recommended):** intercept task switches; load next task URL in a hidden buffer iframe (or second frame); when `load` fires, swap into view so the user never sees a blank white document
2. And/or: keep previous iframe painted until replacement is ready (double-buffer in `MailSection` parent)
3. Optional: reduce proxy TTFB (less rewrite work, cache static Roundcube assets) — secondary

Must not regress: sticky auth (Iter 8), Help new-tab, logout, 0009 fixes.

### Links

- Dev: `docs/qa/handoffs/HANDOFF-DEV-admin-console-0010.md`
- PR: https://github.com/albertzang/ccvaa-web/pull/4

---

## admin-console-0009 — Embedded Hover mailbox issues

| Field | Value |
|-------|--------|
| **Type** | `bug` |
| **Priority** | `now` |
| **Status** | `completed` |
| **Source** | `ceo` |
| **Verifier** | `ceo` |
| **Verify passes** | `pass2` |
| **Ship path** | `direct-to-main` |

### Description

Umbrella ticket for Hover webmail iframe issues on `/admin` (same-origin proxy `/admin/mail`). CEO verified 2026-07-12 after Iteration 3.

**Environment:** Production — https://ccvaa-web.vercel.app/admin (Mail section)

### Iteration 1 — Inbox refresh HTTP 403 (CEO verified)

**Fix:** Forward `X-Roundcube-Request`; normalize `/admin/mail/?…` trailing-slash AJAX paths. Commit `6001ff1`.

### Iteration 2 — Toolbar More / Mark reloads iframe (CEO verified)

**Fix:** Capture-phase click guard on hash-only `<a href>` under injected `<base href="/admin/mail/">`. Commit `c107c5c`.

### Iteration 3 — Blank `#header` after login (CEO verified)

**Fix:** Inject CSS `#header{display:none!important}` in proxied HTML. Commit `12eebb5`.

### Links

- Dev: `docs/qa/handoffs/HANDOFF-DEV-admin-console-0009.md`
- Commits: `6001ff1`, `c107c5c`, `12eebb5`

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

Replace the Members “coming soon” scaffold with a real auth-gated members list. Scope TBD with CEO (fields, CRUD vs read-only). Must remain behind admin mail-session auth.

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

**Obsolete after admin-console-0010** (OTP removed; admin auth = Hover mailbox session). Keep only if CEO revives a dedicated QA mailbox for a different purpose.

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

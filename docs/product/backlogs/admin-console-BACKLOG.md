# Backlog: Admin Console

**Feature:** Admin Console  
**Slug:** `admin-console`  
**Owner:** Product Manager  
**Next ID:** `0013`  

Canonical work IDs: `admin-console-NNNN`. Schema: [`../BACKLOG.md`](../BACKLOG.md).

---

## admin-console-0012 — “Go back to Hover.com” opens in new tab

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

**Summary:** On the Hover mailbox login page inside `/admin` iframe, the **Go back to Hover.com** link points at `https://www.hover.com/` and fails when navigated inside the iframe. It should open in a **new browser tab**.

**Environment:** Production — https://ccvaa-web.vercel.app/admin (Webmail, logged out)

**Expected:** Clicking “Go back to Hover.com” opens `https://www.hover.com/` in a new tab (`target="_blank"` + `rel="noopener noreferrer"`).

**Actual:** Link stays in-iframe (or otherwise broken in the embed).

**Severity:** low

**Fix approach:** Same family as Help → new tab — HTML rewrite and/or passive link fixer in `src/app/admin/mail/[[...path]]/route.ts` for `www.hover.com` (and plain `hover.com` if present) anchors.

### Links

- Related: Help new-tab rewrite in mail proxy; `admin-console-0011`

---

## admin-console-0011 — Hide Hover login-help on pre-login iframe

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

**Summary:** In the embedded Hover mailbox iframe (logged out), hide the login-help block so it does not show before sign-in.

**Environment:** Production — https://ccvaa-web.vercel.app/admin (Webmail, logged out)

**Selector:** `div#login-form > div.hover-login-help`

**Expected:** That help block is not visible while logged out (login form itself remains usable).

**Actual:** The help block is visible on the pre-login Hover UI.

**Severity:** low

**Fix:** Inject CSS via mail proxy (`HIDE_LOGIN_HELP`). Commit `4718bf4`. CEO verified 2026-07-12.

### Links

- Commit: `4718bf4`
- Related: `admin-console-0009` Iteration 3 (`#header` hide)

---

## admin-console-0010 — Auth = Hover mailbox iframe session (prune OTP)

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `completed` |
| **Verifier** | `ceo` |
| **Verify passes** | `pass1` |
| **Ship path** | `feature-branch` |

### Description

Replace OTP admin login with **Hover webmail iframe session** as the sole auth signal, prune the OTP stack, and ship a sidebar admin console with a polished embedded mailbox.

**Verifier / ship:** feature branch + CEO Pass 1 on Preview only (skip Pass 2). Multiple iterations on this work ID (PR #4). CEO verified 2026-07-12.

### Accomplished (overall)

- **Auth:** Admin logged in/out iff Hover mailbox in the iframe is logged in/out; OTP UI/APIs/libs/env deps removed; sticky auth so in-iframe nav does not flash logged-out chrome
- **Layout:** Dark admin nav (sidebar on `md+`; phone = brand + collapsed menu toggle) — Webmail → Members → Events → Financial + cream main panel; shared `BrandMark` with public homepage; no device gate
- **Mail embed UX:** Help opens Hover docs in a new tab; task switches (Mail/Files/Calendar/Contacts) stay in-iframe with preload-then-swap (no white flash); Hover compose discard dialog preserved; prior proxy hardening retained (CSRF refresh, More/Mark, hide blank `#header`)
- **Docs:** FEATURES.md / `.env.example` / OTP-centric notes updated for mail-session auth; mobile-gate references removed

**Security:** Admin privilege = whoever can sign into `info@ccvaa.ca` via embedded webmail (same inbox OTP previously used).

**Out of scope:** Real Members/Events/Financial CRUD; replacing Hover.

### Links

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

- PR: https://github.com/albertzang/ccvaa-web/pull/2

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

- Source: baseline-0001 (git history)
- PR: https://github.com/albertzang/ccvaa-web/pull/1

---

## admin-console-0005 — Dedicated QA test inbox for OTP

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `later` |
| **Status** | `closed` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |

### Description

**Closed 2026-07-12:** Obsolete after `admin-console-0010` (OTP removed; admin auth = Hover mailbox session). Reopen only if CEO wants a dedicated QA mailbox for a different purpose.

### Links

- `docs/protocols/QA_AUTH.md`

---

## admin-console-0004 — Ensure Preview env covers admin OTP/mail

| Field | Value |
|-------|--------|
| **Type** | `task` |
| **Priority** | `now` |
| **Status** | `closed` |
| **Verifier** | `agent` |
| **Verify passes** | `pass1+pass2` |
| **Ship path** | `feature-branch` |

### Description

**Closed 2026-07-12:** Obsolete after `admin-console-0010`. Preview no longer needs SMTP / `ADMIN_SESSION_SECRET` / `KV_REST_API_*` for admin login. Remaining Preview needs (Deployment Protection bypass, mail proxy reachability to Hover) are covered by existing protocols — not this OTP-era checklist.

### Links

- `docs/protocols/GIT_DEPLOY.md`, `QA_AUTH.md`, `PREVIEW_PROTECTION.md`

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

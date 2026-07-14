# Preview deployment protection

## Decision

**Preview** deployments use Vercel **Deployment Protection** (Vercel Authentication). Random visitors with a Preview URL hit a login wall. **Production** (`ccvaa-web.vercel.app`) stays reachable for agent QA Pass 2 / baseline without this bypass.

Agents on this workstation bypass Preview protection using a secret stored only in **gitignored** `.env.local` — CEO does **not** paste the bypass each Pass 1.

## Secret

| Item | Detail |
|------|--------|
| Env var name | `VERCEL_AUTOMATION_BYPASS_SECRET` |
| Where set (local) | `.env.local` (gitignored) — key present; CEO pastes Vercel-generated value |
| Where set (Vercel) | Project → Settings → **Deployment Protection** → **Protection Bypass for Automation** (same value) |
| Never | Commit the value, put it in `docs/`, handoffs, QA reports, or chat logs |

Documented empty key also in `.env.example` (no real secret).

## How QA opens a protected Preview URL

1. Read `VERCEL_AUTOMATION_BYPASS_SECRET` from `.env.local` (or process env). If empty/missing → **block** and ask CEO to fill `.env.local` (do not invent a value).
2. **Browser Pass 1 (required):** navigate with **both** query params on the **same** navigation:

   `https://<preview-host>/<path>?x-vercel-protection-bypass=<secret>&x-vercel-set-bypass-cookie=true`

   If the URL already has a query string, append `&x-vercel-protection-bypass=<secret>&x-vercel-set-bypass-cookie=true`.

   - `x-vercel-protection-bypass` authenticates the request.
   - `x-vercel-set-bypass-cookie=true` sets a same-origin bypass cookie so later client `fetch` / form posts keep the session.
   - **Query-only bypass (secret without set-bypass-cookie) is insufficient** for interactive browser forms and same-origin client fetches.
3. **curl / API / non-browser checks:** may use the header `x-vercel-protection-bypass: <secret>` alone, or the bypass query alone — set-bypass-cookie is not required when there is no browser cookie jar / client fetch session.
4. Do **not** print the secret in reports, screenshots committed to git, or bug files.
5. After navigation, confirm there is **no** Vercel login wall. If a wall still appears → **block** (wrong secret, protection config, or tool not sending both params for browser); ask PM/CEO — do not thrash.

## Handoff requirements (Pass 1)

- **Preview URL** (exact) still required.
- Note: “Preview is protection-bypassed via `.env.local` `VERCEL_AUTOMATION_BYPASS_SECRET`” — do **not** paste the secret into the handoff file. Browser Pass 1 uses both bypass + set-bypass-cookie (see above).
- Production / baseline / Pass 2: bypass **not** required for `https://ccvaa-web.vercel.app/`.

## CEO one-time setup

1. Vercel → Deployment Protection → enable protection on **Preview**.
2. Enable **Protection Bypass for Automation**; copy the generated secret.
3. Paste into local `.env.local` as `VERCEL_AUTOMATION_BYPASS_SECRET=...`
4. Keep the same secret configured in Vercel (rotate later by updating both places).

## Related

- Ship path / Preview URL ownership: `docs/protocols/GIT_DEPLOY.md`
- Admin mailbox login (separate from bypass): `docs/protocols/QA_AUTH.md`

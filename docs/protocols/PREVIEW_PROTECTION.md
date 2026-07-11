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
2. Prefer query param (works with browser navigation):

   `https://<preview-host>/<path>?x-vercel-protection-bypass=<secret>`

   If the URL already has a query string, append `&x-vercel-protection-bypass=<secret>`.
3. Optional equivalent header: `x-vercel-protection-bypass: <secret>`
4. Do **not** print the secret in reports, screenshots committed to git, or bug files.
5. If a Vercel login wall still appears → **block** (wrong secret, protection config, or tool not sending bypass); ask PM/CEO — do not thrash.

## Handoff requirements (Pass 1)

- **Preview URL** (exact) still required.
- Note: “Preview is protection-bypassed via `.env.local` `VERCEL_AUTOMATION_BYPASS_SECRET`” — do **not** paste the secret into the handoff file.
- Production / baseline / Pass 2: bypass **not** required for `https://ccvaa-web.vercel.app/`.

## CEO one-time setup

1. Vercel → Deployment Protection → enable protection on **Preview**.
2. Enable **Protection Bypass for Automation**; copy the generated secret.
3. Paste into local `.env.local` as `VERCEL_AUTOMATION_BYPASS_SECRET=...`
4. Keep the same secret configured in Vercel (rotate later by updating both places).

## Related

- Ship path / Preview URL ownership: `docs/protocols/GIT_DEPLOY.md`
- OTP readout (separate from bypass): `docs/protocols/QA_AUTH.md`

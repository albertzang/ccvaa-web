# ESP integration notes (members-0003 stub / members-0022 landing)

Neon is the **source of truth** for newsletter preference (`members.newsletter_status`). Resend handles **transactional** OTP/confirm mail only. The ESP (email service provider for blasts) syncs on/off when configured — stub until CEO chooses a provider (`members-0009`).

## Unsubscribe footer URL (ESP templates)

Use this URL in ESP email footers so recipients can one-click unsubscribe:

```
{SITE_ORIGIN}/?unsub={UNSUB_TOKEN}#membership
```

| Placeholder | Value |
|-------------|-------|
| `SITE_ORIGIN` | Public site origin — Production: `https://ccvaa-web.vercel.app` or `https://ccvaa.ca` (CEO DNS). Preview: Vercel Preview URL. |
| `UNSUB_TOKEN` | Per-recipient token from `unsub_tokens` table (created when newsletter is turned on). |

Example:

```
https://ccvaa-web.vercel.app/?unsub=seed-unsub-annual-member#membership
```

### Behaviour

- `/?unsub=<token>` redirects to `GET /api/members/newsletter/unsub/landing` (Route Handler) so redeem + session cookie run outside the RSC page; then redirects to `/?unsubscribed=1|already|invalid#membership`.
- Landing redeems the token server-side (idempotent — safe to reload).
- Sets `newsletter_status` to `off` only — **never** changes `membership_plan` or `membership_status`.
- Establishes/resumes a **verified member session** for the token’s member and opens `#membership` in verified state with the newsletter toggle **off**.
- Invalid/expired token: clear message on `#membership` without a verified session.
- In-portal toggle (while verified): on/off with **no** additional OTP; membership untouched.
- ESP sync stub runs on redeem / toggle when `ESP_API_KEY` + `ESP_LIST_ID` are set (no-op until `members-0009`).

## Env (stub)

See `.env.example` — `ESP_API_KEY`, `ESP_LIST_ID` (commented placeholders).

## Code

- Sync stub: `src/lib/members/esp.ts`
- Unsub redeem: `src/lib/members/newsletter.ts` → `redeemUnsubToken`
- Unsub landing (cookie + redirect): `src/app/api/members/newsletter/unsub/landing/route.ts`
- Session preference: `updateNewsletterPreferenceForSession`
- URL builder: `buildNewsletterUnsubUrl()` in `esp.ts` (hash `#membership`)

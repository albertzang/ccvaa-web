# ESP integration notes (members-0003 stub)

Neon is the **source of truth** for newsletter preference (`members.newsletter_status`). Resend handles **transactional** OTP/confirm mail only. The ESP (email service provider for blasts) syncs on/off when configured — stub until CEO chooses a provider (`members-0009`).

## Unsubscribe footer URL (ESP templates)

Use this URL in ESP email footers so recipients can one-click unsubscribe:

```
{SITE_ORIGIN}/?unsub={UNSUB_TOKEN}#contact
```

| Placeholder | Value |
|-------------|-------|
| `SITE_ORIGIN` | Public site origin — Production: `https://ccvaa-web.vercel.app` or `https://ccvaa.ca` (CEO DNS). Preview: Vercel Preview URL. |
| `UNSUB_TOKEN` | Per-recipient token from `unsub_tokens` table (created on newsletter confirm). |

Example:

```
https://ccvaa-web.vercel.app/?unsub=seed-unsub-annual-member#contact
```

### Behaviour

- Landing redeems the token server-side (idempotent — safe to reload).
- Sets `newsletter_status` to `off` only — **never** changes `membership_plan` or `membership_status`.
- Shows confirmation in Contact `#contact`.
- ESP sync stub runs on redeem when `ESP_API_KEY` + `ESP_LIST_ID` are set (no-op until `members-0009`).

## Env (stub)

See `.env.example` — `ESP_API_KEY`, `ESP_LIST_ID` (commented placeholders).

## Code

- Sync stub: `src/lib/members/esp.ts`
- Unsub redeem: `src/lib/members/newsletter.ts` → `redeemUnsubToken`
- URL builder: `buildNewsletterUnsubUrl()` in `esp.ts`

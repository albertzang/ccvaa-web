# Mailosaur — Preview QA inbox (members-0002+)

Use [Mailosaur](https://mailosaur.com/) to capture OTP and confirm emails on **Dev** and **Preview** without real inboxes. Production uses live Resend delivery to real addresses (CEO go-live in `members-0009`).

## Why Mailosaur

- Resend sends OTP emails to any address, including Mailosaur catch-all inboxes.
- QA reads the 6-digit code from Mailosaur (dashboard or API) to verify `deliverOtp` / confirm helpers without public forms (those land in `members-0003` / `members-0005`).
- Keeps test traffic out of `info@ccvaa.ca` and CEO mailboxes.

## Setup (CEO / QA workstation)

1. Create a Mailosaur account and a **Server** (note the **Server ID**).
2. Copy the **API key** and **Server ID** into `.env.local` (never commit):

   ```bash
   MAILOSAUR_API_KEY=your_api_key
   MAILOSAUR_SERVER_ID=your_server_id
   ```

3. For **Vercel Preview**, CEO sets the same vars in the Preview environment when OTP send tests are needed on Preview (optional until later tickets exercise live send on Preview).

4. Resend (required to send):

   ```bash
   RESEND_API_KEY=re_...
   RESEND_FROM_EMAIL="CCVAA <onboarding@resend.dev>"   # Resend test from-address on Dev/Preview
   DATABASE_URL=postgresql://...                        # Neon — challenge persistence
   ```

## Test email address format

Each Mailosaur server has a domain:

```text
anything@{SERVER_ID}.mailosaur.net
```

Example: if `MAILOSAUR_SERVER_ID=abc123`, use `qa-login@abc123.mailosaur.net` as the recipient when running the send test script.

## Dev send test script

With `.env.local` configured (`DATABASE_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`):

```bash
npm run members:send-otp-test -- --email qa@YOUR_SERVER_ID.mailosaur.net --purpose login
```

Then fetch the message in Mailosaur (dashboard → server → latest message) or via Mailosaur API using `MAILOSAUR_API_KEY`.

Supported `--purpose` values: `login`, `email_verify`, `newsletter_confirm`.

## Verify flow (local)

After receiving the code in Mailosaur, verify with application code or a future public form. For manual Dev check, use Node REPL or a small script importing `verifyDeliveredOtp` from `@/lib/members/confirm`.

Seed data includes a static OTP for the annual member (`123456`) — see `npm run db:seed` output; that path does **not** exercise Resend.

## Rate limits (documented for QA)

| Limit | Value |
|-------|-------|
| OTP lifetime | 15 minutes |
| Max challenges per email + purpose per hour | 3 |
| Max verify attempts per challenge | 5 |

Exceeding limits returns `MEMBERS_RATE_LIMITED` or `MEMBERS_OTP_EXHAUSTED` — request a fresh code after the window.

## Health check

`GET /api/members/health` reports:

```json
{
  "email": {
    "resend": "configured" | "missing",
    "mailosaur": "configured" | "missing"
  }
}
```

Mailosaur is **optional** (QA tooling only). Resend + `DATABASE_URL` are **required** to exercise live send + verify.

## Out of scope here

- Public newsletter / login UI (`members-0003`, `members-0005`)
- ESP blasts
- Production from-address (`members-0009`)

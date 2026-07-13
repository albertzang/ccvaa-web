# QA auth access (admin)

Admin console auth is the **Hover webmail session** inside `/admin` Mail (same-origin `/admin/mail` proxy). There is **no OTP** send/verify flow.

## Principle

| Concern | Owner |
|---------|--------|
| Mailbox credentials | **CEO** — local `.env.local`: `ADMIN_EMAIL` + `ADMIN_PASS` (see `.env.example`) |
| Never commit mailbox passwords | Everyone — never put them in handoffs, reports, or chat |
| Preview Deployment Protection bypass | CEO sets secret; see `docs/protocols/PREVIEW_PROTECTION.md` |

## How to verify admin auth on Preview / Production

1. Open `/admin` on the target URL.
2. Expand **Mail**, sign in to Hover webmail using `ADMIN_EMAIL` / `ADMIN_PASS` from `.env.local` (do not paste into reports).
3. Confirm Members / Financial / Events scaffolds and header **Log out** appear.
4. Sign out via header **Log out** (or mail logout) and confirm scaffolds hide / logged-out chrome returns.
5. Never write mailbox passwords into reports, bugs, commits, or screenshots.

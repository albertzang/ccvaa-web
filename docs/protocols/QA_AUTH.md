# QA auth access (admin)

> **Superseded for admin login (admin-console-0010):** Admin console auth is the **Hover webmail session** inside `/admin` Mail (same-origin `/admin/mail` proxy). There is **no OTP** send/verify flow. Agents and CEO verify by signing into the mailbox in the iframe (or confirming logged-out chrome when signed out). Do not ask for 6-digit codes.

## Current principle

| Concern | Owner |
|---------|--------|
| Mailbox password / webmail login | **CEO** (or whoever holds `info@ccvaa.ca`) |
| Never commit mailbox passwords | Everyone |
| Preview Deployment Protection bypass | CEO sets secret; see `docs/protocols/PREVIEW_PROTECTION.md` |

## How to verify admin auth on Preview / Production

1. Open `/admin` on the target URL (desktop/tablet).
2. Expand **Mail**, sign in to Hover webmail as `info@ccvaa.ca`.
3. Confirm Members / Financial / Events scaffolds and header **Log out** appear.
4. Sign out via header **Log out** (or mail logout) and confirm scaffolds hide / logged-out chrome returns.
5. Never write mailbox passwords into reports, bugs, commits, or screenshots.

## Historical (OTP — removed)

The previous single-Send OTP + CEO-in-the-loop protocol, SMTP/`ADMIN_OTP_*` env, and Redis challenge store were removed with **admin-console-0010**. Older QA handoffs/reports may still mention OTP; ignore those steps for current `/admin`.

Roadmap item **admin-console-0005** (dedicated QA inbox for OTP) is obsolete unless revived for a different purpose.

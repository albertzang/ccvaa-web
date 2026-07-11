# QA auth access (admin OTP)

## Principle

QA must be able to verify admin login when the handoff requires it, **without** storing mailbox passwords or OTP codes in the repo, handoffs, or long-lived agent memory.

| Concern | Owner |
|---------|--------|
| SMTP / env so codes **send** | CEO (Vercel env) + Developer if code/config bugs |
| Codes **read** from the inbox | **CEO** (current standard) |
| Never commit OTP codes or mailbox passwords | Everyone |

## Current standard: CEO-in-the-loop

1. QA (or handoff) triggers **Send login code** on the target URL (Preview or Production).
2. Code is emailed to `info@ccvaa.ca` (or `ADMIN_OTP_EMAIL`).
3. **CEO** opens Hover webmail, reads the 6-digit code, and pastes it **once** into the QA chat for that session.
4. QA completes login + post-login checks.
5. QA **must not** write the code into reports, bugs, commits, or screenshots that are committed.
6. If CEO is unavailable: mark full login / scaffolds as **blocked** (not an automatic product fail). Still test request UI, cooldown, and clear errors. Note the block in the QA report.

### Do not

- Give the QA agent standing credentials for `info@ccvaa.ca`
- Put mailbox passwords in `.cursor/`, docs, or chat for “convenience”
- Leave OTP codes in git history or FEATURES.md

### Handoff hint

On QA handoffs that need full login, PM/Developer should note:

> **OTP readout:** CEO-in-the-loop (see `docs/protocols/QA_AUTH.md`). Coordinate with CEO when Send is clicked.

## Future (roadmap): dedicated test inbox

Later option: a throwaway mailbox used only for QA, with `ADMIN_OTP_EMAIL` (likely Preview-first) and secrets only in Vercel env — never in git. Tracked on `docs/product/ROADMAP.md` under Later. Until then, use CEO-in-the-loop.

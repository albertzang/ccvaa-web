# Product roadmap (lightweight)

> **Owner:** Product Manager. Update with CEO; do not treat as a binding sprint plan.

## Now
- Stabilize admin OTP + Hover mail on production (CEO configuring Vercel env; **BUG-20260710-01**)
- Multi-agent OS + git/deploy + **baseline** QA + CEO-in-the-loop OTP readout (`docs/protocols/QA_AUTH.md`)

## Next
- Members list (auth-gated)
- Financial dashboard (auth-gated)
- Events/posts list + CRUD
- Ensure Vercel Preview env vars cover admin OTP/mail when needed

## Later
- Hardened rate limiting for multi-instance Vercel
- Real board portraits and bios
- Automated QA smoke on Preview/Production deploy
- Optional long-lived staging branch/domain if Preview-per-PR is not enough
- **Dedicated QA test inbox** for admin OTP (Preview-first `ADMIN_OTP_EMAIL` + Vercel-only secrets; replace or supplement CEO-in-the-loop — see `docs/protocols/QA_AUTH.md`)

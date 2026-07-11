# QA auth access (admin OTP)

## Principle

QA must be able to verify admin login when the handoff requires it, **without** storing mailbox passwords or OTP codes in the repo, handoffs, or long-lived agent memory.

| Concern | Owner |
|---------|--------|
| SMTP / env so codes **send** | CEO (Vercel env) + Developer if code/config bugs |
| Codes **read** from the inbox | **CEO** (current standard) |
| Never commit OTP codes or mailbox passwords | Everyone |
| Never spam OTP **Send** | **QA** — single-Send protocol below |

Server limits (do not burn them): **1 Send / minute**, **5 Sends / hour / IP**. Each Send replaces the active challenge for that IP — extra Sends cause stale emails and “Incorrect code.”

## Single-Send OTP protocol (required for full admin login)

Whenever a handoff needs **full login** (session + scaffolds / post-auth features), QA **must** follow this:

1. Finish any non-login checks first (public pages, mobile gate, mail iframe open, etc.).
2. Perform **exactly one** successful **Send login code** on the target environment (Preview or Production).
3. **Immediately stop** and ask the parent/CEO for the **newest** 6-digit code from `info@ccvaa.ca` (or `ADMIN_OTP_EMAIL`).
4. **Wait** for the CEO to paste the code into the parent chat and for PM to resume QA — do **not** Send again while waiting.
5. **Verify once** with that code; confirm scaffolds / handoff checklist.
6. Never write the OTP into reports, bugs, commits, or committed screenshots.
7. If verify fails with a fresh coordinated code → sign **retest** / **hold** and stop; do **not** burn the hourly quota with retries. Escalate to PM (CEO may flush Redis rate keys or wait out the window).

### Do not

- Click **Send** more than once per login success-path attempt
- Ask CEO to Send on the same environment during the QA attempt (splits IP challenges / stale mail)
- Run wrong-code / lockout / multi-Send cooldown drills in the same pass as full login unless the handoff explicitly requires them **and** quota allows — prefer a separate handoff or skip to save the 5/hour budget
- Give the QA agent standing mailbox credentials
- Put mailbox passwords or OTP codes in git / docs / chat logs for reuse

### If CEO is unavailable

Mark full login / scaffolds as **blocked** (not an automatic product fail). You may still test **Send UI once** (success or clear error) without completing verify — or skip Send entirely and note blocked. Do not loop Sends.

### Handoff hint

On QA handoffs that need full login, PM/Developer must note:

> **OTP:** single-Send + CEO-in-the-loop (`docs/protocols/QA_AUTH.md`). QA Sends once → CEO pastes newest code → QA verifies once. No extra Sends.

Handoffs that only need “Send fails / error copy / cooldown” may allow limited Sends without full login — still avoid unnecessary repeats.

## Future (roadmap): dedicated test inbox

Later option: a throwaway mailbox used only for QA, with `ADMIN_OTP_EMAIL` (likely Preview-first) and secrets only in Vercel env — never in git. Tracked on `docs/product/ROADMAP.md` under Later. Single-Send discipline still applies.

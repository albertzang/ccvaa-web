# CCVAA Web — Agent Operating System

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Guiding principles

1. **Repo is the brain, chat is the scratchpad** — Durable truth lives in docs, backlogs, and protocols. Agents can be summarized or swapped without losing the product.
2. **One decision-maker** — The CEO gates ship, secrets, and “done.” Agents advise and execute; they do not invent authority.
3. **Clear roles, thin interfaces** — Product Manager, Developer, and QA each own a job. Handoffs are short, structured, and ephemeral when the work ends.
4. **Defaults over debates** — Verifier, Ship path, and Verify passes have defaults so every ticket does not re-negotiate process.
5. **Small loops, same ID** — Prefer Iteration on one work ID until verified. Avoid ID sprawl and versioned handoff/report files.
6. **Encode friction once** — When something hurts twice, turn it into a rule, skill, or protocol — then stop re-explaining it in chat.
7. **Least process that still prevents mistakes** — Protect secrets, `main`, and wrong-env testing; drop ceremony that does not change outcomes.
8. **Observable “done”** — `completed` / `closed` / `verified` mean the same thing to every role, including what gets deleted vs kept.

Operating docs live under [`docs/`](docs/README.md). Refine this OS via `agent-os-*` backlog items with CEO approval.

## Multi-agent roles

This repo uses a **3-agent system**. The human CEO primarily talks to the **Product Manager** (advisor + product owner). Developer and QA are specialists invoked via separate chats, `@` rules/skills, or Task subagents.

| Role | How to work with them | Owns |
|------|------------------------|------|
| **Product Manager** | Primary CEO chat; `.cursor/agents/product-manager.md` | Priorities, advice, handoffs, FEATURES/backlogs; **guides CEO gates** (`docs/protocols/CEO.md`) |
| **Developer** | Dev chat or agent `developer` | Feature branches, PRs, implementation (merge when asked) |
| **QA** | QA chat or agent `qa` | Pass 1 (Preview), Pass 2 (post-merge), or **baseline** when **Verifier = `agent`**; skipped when Verifier = `ceo` (CEO verifies) |
| **CEO (human)** | This chat via PM | Approvals, secrets, admin mailbox credentials, `ccvaa.ca`, kickoffs, optional **Verifier** — `docs/protocols/CEO.md` |

### How to start a role chat

Fixed chat titles (rename on session start / if the title drifts; no work-ID or topic titles):

| Role | Chat title |
|------|------------|
| Product Manager | `Product Manager` |
| Developer | `Developer` |
| QA | `QA` |

1. **PM (default):** continue in the Product Manager chat; attach rule/skill `product-manager` if needed
2. **Developer:** new chat → “You are the CCVAA Developer” or invoke agent `developer`; attach handoff
3. **QA:** new chat → “You are CCVAA QA” or invoke agent `qa`; name environments / Preview URL

Shared brain (not chat history):

- `docs/product/FEATURES.md` — living feature inventory (PM maintains)
- `docs/product/BACKLOG.md` — feature backlogs + work IDs `{feature-slug}-{NNNN}`
- `docs/protocols/` — communication, handoff, git/deploy, QA auth, Preview protection, **CEO responsibilities**
- `docs/templates/` — bug / feature / QA / handoff templates
- `docs/handoffs/` / `docs/reports/` — ephemeral handoffs & reports (deleted when work closes)
- `.cursor/rules/` — shared + role rules
- `.cursor/skills/` — `product-manager`, `developer`, `ccvaa-dev-memory`, `qa`
- `.cursor/agents/` — `product-manager`, `developer`, `qa`

## Environments (agent Dev/QA)

| Name | URL | Tracks |
|------|-----|--------|
| Dev | http://localhost:3000/ | Local |
| Preview | Vercel URL for the PR/branch (from GitHub/Vercel) | Feature branch — **pre-merge** (Deployment Protection; QA bypass via `.env.local`) |
| Production | https://ccvaa-web.vercel.app/ | `main` — QA Pass 2 and **baseline** |

**CEO-only (out of agent flow):** https://ccvaa.ca/ — public domain; CEO handles manual testing (DNS/cache). Agents do not use it for Pass 1/2/baseline.

**Default ship path (Verifier = `agent`):** feature branch → QA on Dev (optional) + Preview (required) → merge to `main` → delete feature branch → QA Production smoke on `ccvaa-web.vercel.app`.  
**Verifier = `ceo`:** defaults to `direct-to-main` + CEO Production verify (`pass2`); no agent QA.  
**Baseline:** PM/CEO may request a Production-only audit with no PR (`Pass: baseline`). 
Full rules: `docs/protocols/GIT_DEPLOY.md`.

## Stack (quick)

- Next.js 16 App Router, React 19, Tailwind 4, TypeScript
- Deploy: Vercel (GitHub → Production on `main`; Preview per branch/PR)
- Email / webmail: Hover (`info@ccvaa.ca`) via same-origin `/admin/mail` proxy
- Admin auth: Hover mailbox session inside the admin iframe (no OTP)
- Secrets: `.env.local` (local; incl. `ADMIN_EMAIL` / `ADMIN_PASS` for QA sign-in, Preview bypass) — never commit secrets

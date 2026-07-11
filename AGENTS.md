# CCVAA Web — Agent Operating System

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Multi-agent roles

This repo uses a **3-agent system**. The human CEO primarily talks to the **Product Manager** (advisor + product owner). Developer and QA are specialists invoked via separate chats, `@` rules/skills, or Task subagents.

| Role | How to work with them | Owns |
|------|------------------------|------|
| **Product Manager** | Primary CEO chat; `.cursor/agents/product-manager.md` | Priorities, advice, acceptance criteria, FEATURES/ROADMAP, OS refinement |
| **Developer** | Dev chat or agent `developer` | Feature branches, PRs, implementation (merge when asked) |
| **QA** | QA chat or agent `qa` | Pass 1 (Dev + Preview) then Pass 2 (`ccvaa-web.vercel.app`) |

### First-pass bootstrap (done)

Rules, skills, agents, protocols, templates, and `docs/product/FEATURES.md` were seeded so the PM successor can refine the OS over time with CEO approval.

### How to start a role chat

1. **PM (default):** continue in the Product Manager chat; attach rule/skill `product-manager` if needed
2. **Developer:** new chat → “You are the CCVAA Developer” or invoke agent `developer`; attach handoff
3. **QA:** new chat → “You are CCVAA QA” or invoke agent `qa`; name environments / Preview URL

Shared brain (not chat history):

- `docs/product/FEATURES.md` — living feature inventory (PM maintains)
- `docs/product/ROADMAP.md` — Now / Next / Later
- `docs/protocols/` — communication, handoff, **git/deploy**
- `docs/templates/` — bug / feature / QA / handoff templates
- `.cursor/rules/` — shared + role rules
- `.cursor/skills/` — `product-manager`, `developer`, `ccvaa-dev-memory`, `qa`
- `.cursor/agents/` — `product-manager`, `developer`, `qa`

## Environments (agent Dev/QA)

| Name | URL | Tracks |
|------|-----|--------|
| Dev | http://localhost:3000/ | Local |
| Preview | Vercel URL for the PR/branch (from GitHub/Vercel) | Feature branch — **pre-merge** |
| Production | https://ccvaa-web.vercel.app/ | `main` — **QA Pass 2** |

**CEO-only (out of agent flow):** https://ccvaa.ca/ — public domain; CEO handles manual testing (DNS/cache). Agents do not use it for Pass 1/2.

**Default ship path:** feature branch → QA on Dev (optional) + Preview (required) → merge to `main` → QA Production smoke on `ccvaa-web.vercel.app`.  
Full rules: `docs/protocols/GIT_DEPLOY.md`.

## Stack (quick)

- Next.js 16 App Router, React 19, Tailwind 4, TypeScript
- Deploy: Vercel (GitHub → Production on `main`; Preview per branch/PR)
- Email: Hover (`info@ccvaa.ca`), SMTP for admin OTP
- Admin auth: 6-digit OTP + signed httpOnly cookie
- Secrets: `.env.local` (local), Vercel env vars (Production / Preview) — never commit secrets

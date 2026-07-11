# Coast to Coast Visual Arts Association (CCVAA)

Public website for the Coast to Coast Visual Arts Association — a non-profit organization registered in British Columbia, Canada.

## Tech stack

- [Next.js](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [GitHub Actions](https://github.com/features/actions) for CI (lint, typecheck, build)
- [Vercel](https://vercel.com/) for deployment (recommended)

## Getting started

**Requirements:** Node.js 20+ (see `.nvmrc`)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start development server |
| `npm run build`   | Production build         |
| `npm run start`   | Serve production build   |
| `npm run lint`    | Run ESLint               |
| `npm run typecheck` | TypeScript check       |

## Project structure

```
src/
├── app/              # Next.js App Router pages & layout
├── components/       # UI components (Header, Hero, etc.)
└── lib/
    └── site.ts       # Organization content & site config (edit here first)
```

**Updating homepage content:** Edit `src/lib/site.ts` — all copy, contact info, and navigation live in one place.

## CI/CD

Every push and pull request to `main` runs:

1. ESLint
2. TypeScript typecheck
3. Production build

No tests are configured yet. Add a `test` script and CI step when logic grows more complex.

### Deployment (Vercel + GitHub)

1. Push this repo to GitHub (see below).
2. Sign in to [vercel.com](https://vercel.com/) with your GitHub account.
3. **Add New Project** → import `ccvaa-web`.
4. Vercel auto-detects Next.js. Click **Deploy**.
5. Each push to `main` deploys automatically.

Optional: enable **Vercel Deployment Protection** or require CI to pass before deploy under Project Settings → Git.

## Push to GitHub

If you have not authenticated the GitHub CLI:

```bash
gh auth login
```

Then create and push the remote repository:

```bash
gh repo create ccvaa-web --public --source=. --remote=origin --push
```

Or, if the repo already exists on GitHub:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ccvaa-web.git
git push -u origin main
```

## Custom domain

Public site: https://ccvaa.ca/ (CEO-managed DNS). Agent Dev/QA Production target: https://ccvaa-web.vercel.app/. See `docs/protocols/GIT_DEPLOY.md`.

## Future: data storage

When you add dynamic content (events, member portal, donations), common options for a Next.js non-profit site:

| Option | Best for |
| ------ | -------- |
| **Supabase** (Postgres) | Relational data, auth, real-time; generous free tier |
| **Sanity / Contentful** | Marketing content managed by non-technical staff |
| **PlanetScale / Neon** | Serverless Postgres if you prefer SQL without Supabase extras |

Recommendation for CCVAA: start with static content in `site.ts`, then move editable pages to **Sanity** or **Supabase** when non-developers need to update content.

## License

Copyright © Coast to Coast Visual Arts Association. All rights reserved.

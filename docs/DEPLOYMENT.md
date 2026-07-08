# Deployment & custom domain guide

This guide walks you through purchasing a public domain and connecting it to your CCVAA website on Vercel.

## Overview

```
Visitor → your-domain.org → DNS → Vercel → Next.js app (this repo)
```

**Recommended host:** [Vercel](https://vercel.com/) — built by the Next.js team, free tier suitable for non-profits, automatic HTTPS, and GitHub deploy hooks.

---

## Step 1: Deploy to Vercel

1. Push the repository to GitHub (see root [README](../README.md)).
2. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
3. Import the `ccvaa-web` repository.
4. Leave default settings (Framework: Next.js, Build: `npm run build`, Output: default).
5. Click **Deploy** and wait for the first build (~1–2 minutes).
6. You will get a URL like `ccvaa-web.vercel.app` — use this to verify the site before buying a domain.

---

## Step 2: Purchase a domain

### Domain name ideas

- `ccvaa.org` (`.org` is common for non-profits)
- `coasttocoastvisualarts.org`
- `ccvaa.ca` (Canadian presence)

### Where to buy (Canada-friendly registrars)

| Registrar | Notes |
| --------- | ----- |
| [Namecheap](https://www.namecheap.com/) | Affordable, easy DNS |
| [Google Domains → Squarespace Domains](https://domains.squarespace.com/) | Simple UI |
| [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) | At-cost pricing, excellent DNS |
| [CIRA / Canadian registrars](https://www.cira.ca/) | For `.ca` domains |

**Tips:**

- Enable **WHOIS privacy** if included or low cost.
- Register for at least 1 year; enable auto-renew so the domain does not expire.
- Use an email you check regularly for renewal notices.

### `.ca` domains

If you choose `.ca`, CIRA may require proof of Canadian presence (citizenship, residency, or registered Canadian organization). A BC-registered non-profit typically qualifies — check your registrar’s CIRA requirements.

---

## Step 3: Connect domain to Vercel

### Option A: Buy domain through Vercel (simplest)

1. Vercel project → **Settings** → **Domains**.
2. Enter your desired domain and follow Vercel’s purchase flow.
3. DNS is configured automatically.

### Option B: Domain at external registrar (most common)

1. In Vercel: **Project → Settings → Domains → Add**.
2. Enter your domain (e.g. `ccvaa.org` and `www.ccvaa.org`).
3. Vercel shows DNS records to add at your registrar.

**Typical DNS records:**

| Type | Name | Value |
| ---- | ---- | ----- |
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

(Use the exact values Vercel displays — they may change.)

4. At your registrar, open **DNS settings** and add those records.
5. Wait for propagation (minutes to 48 hours; often under 1 hour).
6. Vercel issues a free SSL certificate automatically.

### Update the codebase

After your domain is live, update `src/lib/site.ts`:

```ts
url: "https://ccvaa.org",  // your real domain
```

Also update `organization.email` when you have a real mailbox (e.g. Google Workspace or forwarding from your registrar).

---

## Step 4: Email (optional but recommended)

A domain alone does not include email. Options:

| Service | Cost | Notes |
| ------- | ---- | ----- |
| **Registrar email forwarding** | Free–low | Forwards `info@ccvaa.org` → your Gmail |
| **Google Workspace** | Paid | Professional Gmail, Drive, calendar |
| **Microsoft 365** | Paid | Outlook, common for organizations |
| **Zoho Mail** | Free tier available | Budget-friendly |

For early stage, **email forwarding** from your registrar is enough.

---

## Step 5: Verify everything

Checklist:

- [ ] `https://yourdomain.org` loads the homepage
- [ ] `https://www.yourdomain.org` redirects or loads (configure in Vercel)
- [ ] HTTPS padlock shows (Vercel handles this)
- [ ] CI passes on GitHub before/after deploy
- [ ] Contact email works (send a test to `info@...`)

---

## CI/CD flow (ongoing)

```
git push → GitHub → CI (lint, typecheck, build) → Vercel deploy → live site
```

- **Production:** pushes to `main`
- **Preview:** each pull request gets a unique Vercel preview URL

---

## Troubleshooting

| Issue | Fix |
| ----- | --- |
| Domain not resolving | Wait for DNS propagation; verify records match Vercel exactly |
| SSL certificate pending | Ensure DNS points to Vercel; wait up to 24h |
| Build fails on Vercel | Run `npm run build` locally; check Node version matches `.nvmrc` (20) |
| Wrong site on domain | Confirm domain is added to the correct Vercel project |

---

## Cost estimate (initial milestone)

| Item | Typical cost |
| ---- | ------------ |
| Vercel (hobby) | Free |
| GitHub | Free (public repo) |
| `.org` domain | ~$12–15 USD/year |
| `.ca` domain | ~$15–20 CAD/year |
| Email forwarding | Free |

Total first-year infrastructure can stay under ~$20 USD for a simple public homepage.

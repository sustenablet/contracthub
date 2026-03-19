# ContractHub — Solo Contractor OS

ContractHub is a SaaS web application for **solo contractors and small construction/trades businesses**. It is a back-office command center used by the contractor/owner — manage clients, work orders, invoices, bids & quotes, and scheduling all in one place.

Built with Next.js 16, Supabase, Tailwind CSS v4, and TypeScript.

---

## Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, DM Sans font
- **Backend/DB**: Supabase (PostgreSQL + Row Level Security)
- **Auth**: Supabase Auth (email/password)
- **Deployment**: Vercel

## Features

- Client management with service addresses
- Work order scheduling (one-time and recurring)
- Bids & quotes (estimates) with PDF-ready layout
- Invoice creation and payment tracking
- Revenue and work type analytics
- 30-day free trial, subscription gating

## Local Development

```bash
cd app
cp .env.local.example .env.local
# Fill in your Supabase credentials
npm install
npm run dev
```

App runs at `http://localhost:3001`.

## Database

Supabase project: `oickvofrdenaixxxryar`

```bash
# Push migrations to remote
supabase db push

# Check migration status
supabase migration list
```

## Deployment

Deployed via Vercel. Push to `main` triggers a production deploy.

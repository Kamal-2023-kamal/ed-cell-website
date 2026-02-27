# ED Cell Web

Production-ready Next.js app powered by Supabase. This folder contains the web application.

## Stack
- Next.js 16 (App Router, webpack build)
- React 19
- Tailwind CSS 4
- Supabase (database, storage, realtime)

## Prerequisites
- Node.js 20.x (or >=18)
- Git

## Quick Start (Local Development)
1) Install dependencies

```bash
cd ed-cell-website/web
npm install
```

2) Create `.env.local` in this folder with your values

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_...
# (Alternatively, use NEXT_PUBLIC_SUPABASE_ANON_KEY instead of the publishable key — do not set both)

SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
ADMIN_SETUP_SECRET=your-strong-secret
NEXT_PUBLIC_EVENTS_IMAGES_BUCKET=ed-cell-images
```

3) Run the dev server

```bash
npm run dev
# opens http://localhost:3000
```

## Production Run (Local)
1) Build

```bash
npm run build
```

2) Start (uses the launcher at `index.js`)

```bash
npm start
# set a custom port if needed:
# PORT=30121 npm start
```

The start launcher detects a standalone build when present or falls back to `next start`. It binds to `HOST` (defaults to `0.0.0.0`) and `PORT` (defaults to `3000`).

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` — public client key (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY` — server-only key for admin APIs
- `ADMIN_SETUP_SECRET` — secret you choose for protected admin endpoints
- `NEXT_PUBLIC_EVENTS_IMAGES_BUCKET` — images bucket name (defaults to `ed-cell-images`)

Never commit secrets. Keep `.env.local` out of version control and set variables in your host panel for deployments.

## Admin Endpoints
- Initialize schema and storage:

```bash
curl -X POST http://localhost:3000/api/admin/setup \
  -H "x-admin-secret: YOUR_ADMIN_SETUP_SECRET"
```

- Clear all data (dangerous):

```bash
curl -X POST http://localhost:3000/api/admin/clear \
  -H "x-admin-secret: YOUR_ADMIN_SETUP_SECRET"
```

## Deploy Notes
### Simple panel (Sky-Hostings-style)
Use a startup command that installs, builds, and starts:

```bash
if [[ -d .git ]]; then git pull; fi; npm install; npm run build; npm start
```

Ensure the following environment variables are set in the panel (do not expose server keys publicly):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`), `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SETUP_SECRET`, `NEXT_PUBLIC_EVENTS_IMAGES_BUCKET`.

### Render (Blueprint)
A Render blueprint is provided at `web/render.yaml`. It builds with `npm run build` and starts with `npm run start`. Map env vars in the service settings.

## Troubleshooting
- npm ENOENT about `package.json`: run commands inside `ed-cell-website/web` where `package.json` exists.
- “Missing Supabase environment variables”: ensure all required env vars are set (URL + public key + service role key).
- Port in use: set a different `PORT` when starting (e.g., `PORT=30121 npm start`).
- Images not showing: confirm `NEXT_PUBLIC_EVENTS_IMAGES_BUCKET` matches your Supabase bucket and that it’s public.

## Directory
- `index.js` — launcher that builds/starts the app in production mode.
- `render.yaml` — optional Render deployment config.
- `app/` — Next.js App Router source.
- `components/` — UI and admin components.
- `lib/` — Supabase client setup and utilities.
- `scripts/` — database and startup helpers.

# Deploy Frontend

Purpose: steps for deploying the Next.js app to Vercel.

## One-time setup

1. Push the repo to GitHub (already done — `github.com/titoburgab/quote-invoice`).
2. On vercel.com: **Add New → Project → import the GitHub repo**. Vercel auto-detects Next.js;
   leave the framework preset, root directory (`.`), build command, and output directory on
   their defaults.
3. **Attach a KV store** (needed for the demo backend to actually persist across requests —
   see below): in the Vercel project, go to **Storage → Create Database** (or **Marketplace →
   Upstash for Redis**) and connect it to the project. This sets `KV_REST_API_URL` and
   `KV_REST_API_TOKEN` automatically — no manual env var entry needed.
4. No other environment variables are required yet. The `.env.example` vars
   (`NEXT_PUBLIC_SUPABASE_URL`, etc.) only matter once a real Supabase project replaces the mock
   data layer.

## Every subsequent deploy

Nothing to do manually — pushing to `main` on GitHub auto-deploys via the Vercel Git
integration.

## Why the KV store matters

`src/lib/mock-data.ts` originally used a plain in-memory JS array to fake a database. That
works fine with `npm run dev` (one long-running process) but breaks on Vercel: serverless
functions don't share memory across invocations, so a draft created by one request could 404
on the very next request if it landed on a different instance. The store now persists to
Vercel KV instead when `KV_REST_API_URL` is present, and falls back to in-memory locally.
Skipping step 3 above means the deployed app will have the same 404-on-draft bug.

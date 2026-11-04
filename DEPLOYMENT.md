# Deployment Guide for Bhagavad Gita App

The app is a static site. `bun run build` writes the pages, scripts and all Gita data to `dist/`; there are no serverless functions and no environment variables.

## Vercel (current host)

Pushing to `main` deploys automatically. `vercel.json` does two things:

- rewrites every path except `/data/*` to `/index.html`, so links such as `/chapter/2/verse/47` open the app;
- serves `/data/*` with `Cache-Control: public, max-age=31536000, immutable`.

Because data files are cached for a year, change the folder name and `DATA_VERSION` in `src/lib/gitaData.ts` (for example `v2` → `v3`) whenever `bun run data` produces different files.

## One-time cleanup after the RapidAPI removal

The app no longer calls RapidAPI. After this version is live:

1. Revoke the RapidAPI key in the RapidAPI dashboard.
2. In Vercel → Settings → Environment Variables, delete `RAPIDAPI_HOST`, `RAPIDAPI_KEY` and `RAPIDAPI_BASE_URL`.
3. Delete the local `.env` and `.env.local` files that held the key.

## Checking a deployment

After deployment, these should all load:

- `https://bhagwat-gita-iota.vercel.app/chapters`
- `https://bhagwat-gita-iota.vercel.app/chapter/2/verse/47`
- `https://bhagwat-gita-iota.vercel.app/chapter/2?verse=47` (redirects to the line above)
- `https://bhagwat-gita-iota.vercel.app/data/v2/chapter/2.json`
- `https://bhagwat-gita-iota.vercel.app/sitemap.xml`

and `https://bhagwat-gita-iota.vercel.app/chapter/99` should show the "Page not found" page.

## Other static hosts

Serve `dist/` and rewrite unknown paths to `/index.html`, excluding `/data/`. If the domain changes, update `SITE_URL` in `src/lib/site.ts`, the URLs in `index.html` and `public/robots.txt`, then run `bun run data` to regenerate the sitemap.

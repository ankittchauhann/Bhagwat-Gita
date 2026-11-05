# Deployment Guide for Bhagavad Gita App

The app is a static site. `bun run build` writes the pages, scripts and all Gita data to `dist/`; there are no serverless functions and no environment variables.

## Vercel (current host)

Pushing to `main` deploys automatically. `vercel.json` does four things:

- installs from scratch with `rm -rf node_modules && bun install --frozen-lockfile`. Vercel restores `node_modules` from the last deployment, and Bun can drop a nested package when it installs over an old tree ([oven-sh/bun#7241](https://github.com/oven-sh/bun/issues/7241)). Here that lost the copy of `estree-walker` 2 that `@rollup/pluginutils` needs, and the service-worker build failed with `No "exports" main defined in …/estree-walker/package.json`. A clean install from the lockfile is what CI does, and it takes a few seconds;
- rewrites every path except `/data/*` to `/index.html`, so links such as `/chapter/2/verse/47` open the app;
- serves `/data/*` with `Cache-Control: public, max-age=31536000, immutable`;
- serves `/sw.js` and `/manifest.webmanifest` with `max-age=0, must-revalidate`, so browsers find a new version straight away.

Because data files are cached for a year, change the folder name and `DATA_VERSION` in `src/lib/dataPaths.ts` (for example `v2` → `v3`) whenever `bun run data` produces different files. Readers' saved chapters live in caches named after that version (`gita-text-v2`, `gita-commentary-v2`); the app deletes the old ones on its next start, and readers download again.

## Offline and updates

The build generates a service worker (`dist/sw.js`, from `vite-plugin-pwa`) that precaches the app, its fonts, `chapters.json`, `credits.json` and `sizes.json`. Chapters and commentaries are saved by the page when they load or when the reader downloads them, and the worker serves them from there. After a deploy, open readers see "A new version of the reader is ready · Reload"; installed apps also check for a new version every hour.

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
- `https://bhagwat-gita-iota.vercel.app/chapter/2` (the chapter page)
- `https://bhagwat-gita-iota.vercel.app/about`
- `https://bhagwat-gita-iota.vercel.app/data/v2/chapter/2.json`
- `https://bhagwat-gita-iota.vercel.app/data/v2/credits.json`
- `https://bhagwat-gita-iota.vercel.app/data/v2/sizes.json`
- `https://bhagwat-gita-iota.vercel.app/manifest.webmanifest` and `https://bhagwat-gita-iota.vercel.app/sw.js`
- `https://bhagwat-gita-iota.vercel.app/images/gita-4-7-devanagari-900.jpg`
- `https://bhagwat-gita-iota.vercel.app/sitemap.xml`

and `https://bhagwat-gita-iota.vercel.app/chapter/99` should show the "Page not found" page.

Then check offline once: open `/chapter/2`, turn on airplane mode, reload, and open `/chapter/2/verse/47`. In Chrome DevTools → Application → Manifest there should be no installability warnings.

## Other static hosts

Serve `dist/` and rewrite unknown paths to `/index.html`, excluding `/data/`. If the domain changes, update `SITE_URL` in `src/lib/site.ts`, the URLs in `index.html` and `public/robots.txt`, then run `bun run data` to regenerate the sitemap.

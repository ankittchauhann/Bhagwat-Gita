# API Setup for Bhagavad Gita App

This directory contains Vercel serverless functions that proxy requests to the RapidAPI Bhagavad Gita service. The RapidAPI key only ever lives in these server-side functions (read from `process.env`) — it is never sent to the browser.

Route files under `api/chapters/` use Vercel's bracket-folder convention (e.g. `[chapterId].js`) to map URL params, and just re-export the actual handler logic from `api/_handlers/`. Files and folders prefixed with `_` are not deployed as routes, so `api/_lib` and `api/_handlers` are safe places for shared code and are also what the Vitest suite imports directly (bracket paths can't be globbed reliably by test runners).

## Environment Variables

Create a `.env.local` file in the root directory with:

```env
RAPIDAPI_HOST=bhagavad-gita3.p.rapidapi.com
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_BASE_URL=https://bhagavad-gita3.p.rapidapi.com/v2
```

## API Endpoints

- `GET /api/chapters` - Get all chapters (supports ?skip=0&limit=18)
- `GET /api/chapters/[chapterId]` - Get specific chapter details
- `GET /api/chapters/[chapterId]/verses` - Get all verses for a chapter
- `GET /api/chapters/[chapterId]/verses/[verseNumber]` - Get specific verse

## Deployment

When deploying to Vercel, make sure to add the environment variables in the Vercel dashboard:

1. Go to your project settings
2. Navigate to Environment Variables
3. Add the same variables from your `.env.local`

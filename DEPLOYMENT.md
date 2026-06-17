# Deployment Guide for Bhagavad Gita App

## Problem Solved

Your app was failing on Vercel because the Vite proxy configuration (in `vite.config.ts`) only works during local development. In production, Vercel needs actual API routes to handle the requests.

## What We've Set Up

### 1. Vercel API Routes (JavaScript)

- `api/chapters.js` - List all chapters
- `api/chapters/[chapterId].js` - Get specific chapter
- `api/chapters/[chapterId]/verses.js` - Get all verses for a chapter
- `api/chapters/[chapterId]/verses/[verseNumber].js` - Get specific verse

Each route file just re-exports the real handler from `api/_handlers/`, which is where the logic actually lives (kept out of bracket-path directories so it stays testable).

### 2. Environment Variables

- `.env.local` - For local development (gitignored, not committed)
- `.env.example` - Template for others
- Environment variables are protected by `.gitignore`

### 3. Shared Utility Functions

- `api/_lib/utils.js` - Reusable functions for CORS headers, env validation, and error responses

## Deployment Steps

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Add Vercel API routes with TypeScript and environment variables"
git push origin main
```

### Step 2: Configure Vercel Environment Variables

1. Go to your Vercel dashboard
2. Select your Bhagwat-Gita project  
3. Go to Settings → Environment Variables
4. Add these variables (use your own RapidAPI key — never commit it to source):
   - `RAPIDAPI_HOST` = `bhagavad-gita3.p.rapidapi.com`
   - `RAPIDAPI_KEY` = `<your-rapidapi-key>`
   - `RAPIDAPI_BASE_URL` = `https://bhagavad-gita3.p.rapidapi.com/v2`

### Step 3: Deploy

Vercel will automatically redeploy when you push to main, or you can trigger a manual deployment.

## Testing the API

After deployment, test these URLs:

- `https://bhagwat-gita-iota.vercel.app/api/chapters?skip=0&limit=18`
- `https://bhagwat-gita-iota.vercel.app/api/chapters/1`
- `https://bhagwat-gita-iota.vercel.app/api/chapters/1/verses`

## Security Notes

- API keys are stored as environment variables (not in code)
- CORS headers are properly configured
- Error handling includes proper status codes

# Deployment Guide for Bhagavad Gita App

## Problem Solved

Your app was failing on Vercel because the Vite proxy configuration (in `vite.config.ts`) only works during local development. In production, Vercel needs actual API routes to handle the requests.

## What We've Set Up

### 1. Vercel API Routes (TypeScript)

- `api/chapters.ts` - List all chapters
- `api/chapters/[chapterId].ts` - Get specific chapter
- `api/chapters/[chapterId]/verses.ts` - Get all verses for a chapter  
- `api/chapters/[chapterId]/verses/[verseNumber].ts` - Get specific verse

### 2. Environment Variables

- `.env.local` - For local development (already configured)
- `.env.example` - Template for others
- Environment variables are protected by `.gitignore`

### 3. Generic Utility Functions

- `api/lib/utils.ts` - Reusable functions for API calls, CORS, error handling

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
4. Add these variables:
   - `RAPIDAPI_HOST` = `bhagavad-gita3.p.rapidapi.com`
   - `RAPIDAPI_KEY` = `4af41e915emshcd8cf0801c6079dp1b0ba6jsn3535b27141fd`
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

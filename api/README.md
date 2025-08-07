# API Setup for Bhagavad Gita App

This directory contains Vercel API routes that proxy requests to the RapidAPI Bhagavad Gita service.

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

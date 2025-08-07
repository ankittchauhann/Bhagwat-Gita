import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ApiConfig {
  host: string;
  key: string;
  baseUrl: string;
}

export function getApiConfig(): ApiConfig {
  const host = process.env.RAPIDAPI_HOST;
  const key = process.env.RAPIDAPI_KEY;
  const baseUrl = process.env.RAPIDAPI_BASE_URL;

  if (!host || !key || !baseUrl) {
    throw new Error('Missing required environment variables: RAPIDAPI_HOST, RAPIDAPI_KEY, RAPIDAPI_BASE_URL');
  }

  return { host, key, baseUrl };
}

export function setCorsHeaders(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

export function handleOptions(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.status(200).end();
    return true;
  }
  return false;
}

export async function makeRapidApiRequest(endpoint: string): Promise<any> {
  const config = getApiConfig();
  
  const response = await fetch(`${config.baseUrl}${endpoint}`, {
    headers: {
      'x-rapidapi-host': config.host,
      'x-rapidapi-key': config.key,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`RapidAPI request failed with status: ${response.status}`);
  }

  return response.json();
}

export function handleApiError(error: unknown, res: VercelResponse, context: string): void {
  console.error(`API Error (${context}):`, error);
  
  const message = error instanceof Error ? error.message : 'Unknown error occurred';
  
  res.status(500).json({ 
    error: `Failed to ${context}`,
    message
  });
}

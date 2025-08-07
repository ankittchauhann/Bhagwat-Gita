export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { skip = '0', limit = '18' } = req.query;
    
    // Get environment variables
    const rapidApiHost = process.env.RAPIDAPI_HOST;
    const rapidApiKey = process.env.RAPIDAPI_KEY;
    const rapidApiBaseUrl = process.env.RAPIDAPI_BASE_URL;

    if (!rapidApiHost || !rapidApiKey || !rapidApiBaseUrl) {
      throw new Error('Missing required environment variables');
    }
    
    const response = await fetch(`${rapidApiBaseUrl}/chapters/?skip=${skip}&limit=${limit}`, {
      headers: {
        'x-rapidapi-host': rapidApiHost,
        'x-rapidapi-key': rapidApiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`RapidAPI request failed with status: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch chapters',
      message: error.message || 'Unknown error',
      env_check: {
        has_host: !!process.env.RAPIDAPI_HOST,
        has_key: !!process.env.RAPIDAPI_KEY,
        has_url: !!process.env.RAPIDAPI_BASE_URL
      }
    });
  }
}

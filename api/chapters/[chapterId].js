export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
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
    const { chapterId } = req.query;
    
    const response = await fetch(`https://bhagavad-gita3.p.rapidapi.com/v2/chapters/${chapterId}/`, {
      headers: {
        'x-rapidapi-host': 'bhagavad-gita3.p.rapidapi.com',
        'x-rapidapi-key': '4af41e915emshcd8cf0801c6079dp1b0ba6jsn3535b27141fd',
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
      error: 'Failed to fetch chapter',
      message: error.message 
    });
  }
}

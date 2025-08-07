export default function handler(req, res) {
  // Simple test endpoint
  res.status(200).json({
    message: "API is working!",
    timestamp: new Date().toISOString(),
    method: req.method,
    query: req.query,
    env_vars: {
      has_rapidapi_host: !!process.env.RAPIDAPI_HOST,
      has_rapidapi_key: !!process.env.RAPIDAPI_KEY,
      has_rapidapi_base_url: !!process.env.RAPIDAPI_BASE_URL
    }
  });
}

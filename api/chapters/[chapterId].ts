import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleOptions, setCorsHeaders, makeRapidApiRequest, handleApiError } from '../lib/utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  
  if (handleOptions(req, res)) return;

  try {
    const { chapterId } = req.query;
    const data = await makeRapidApiRequest(`/chapters/${chapterId}/`);
    res.status(200).json(data);
  } catch (error) {
    handleApiError(error, res, 'fetch chapter');
  }
}

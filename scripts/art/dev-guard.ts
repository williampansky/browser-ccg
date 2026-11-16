import type { NextApiRequest, NextApiResponse } from 'next';

/** The art lab writes to Airtable and to `public/`: only on a dev server, and only when the request really is for localhost. */
export const devOnly = (req: NextApiRequest, res: NextApiResponse): boolean => {
  const host = String(req.headers.host || '').split(':')[0];
  if (process.env.NODE_ENV === 'production' || !['localhost', '127.0.0.1'].includes(host)) {
    res.status(404).json({ error: 'The art lab is a local dev tool' });
    return false;
  }
  return true;
};

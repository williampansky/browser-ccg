import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

/** The images under `public/images/backgrounds`, as URLs, for the board lab's background picker (dev tool). */
export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<string[]>,
) {
  try {
    const dir = path.join(process.cwd(), 'public', 'images', 'backgrounds');
    res.status(200).json(
      fs
        .readdirSync(dir)
        .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
        .sort()
        .map((f) => `/images/backgrounds/${f}`),
    );
  } catch {
    res.status(200).json([]);
  }
}

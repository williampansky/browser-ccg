import { NextApiRequest, NextApiResponse } from 'next';
import tempZonesDatabase from '../../../tempZonesDatabase';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!Array.isArray(tempZonesDatabase)) {
      throw new Error('Cannot find zones data');
    }

    res.status(200).json(tempZonesDatabase);
  } catch (err: any) {
    res.status(500).json({ statusCode: 500, message: err?.message });
  }
}

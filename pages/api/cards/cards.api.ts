import { NextApiRequest, NextApiResponse } from 'next';
import tempCardsDatabase from '../../../tempCardsDatabase';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!Array.isArray(tempCardsDatabase)) {
      throw new Error('Cannot find cards data');
    }

    res.status(200).json(tempCardsDatabase);
  } catch (err: any) {
    res.status(500).json({ statusCode: 500, message: err?.message });
  }
}

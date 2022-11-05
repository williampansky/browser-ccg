import { NextApiRequest, NextApiResponse } from 'next';
import { tempUsers } from '../../../tempUsers';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!Array.isArray(tempUsers)) {
      throw new Error('Cannot find user data');
    }

    res.status(200).json(tempUsers);
  } catch (err: any) {
    res.status(500).json({ statusCode: 500, message: err?.message });
  }
}

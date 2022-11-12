import { NextApiRequest, NextApiResponse } from 'next';
import type { ZoneBase } from '../../../types';
import { createZoneObject } from '../../../utils';
import zones from '../../../data/zones.json';

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const zones = await getGameCards(res);
    res.status(200).json(zones);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ statusCode: 500, message: err?.message });
  }
};

async function getGameCards(res: NextApiResponse) {
  const arr = zones.map((item: ZoneBase) => createZoneObject(item));
  res.status(200).json(arr);
}

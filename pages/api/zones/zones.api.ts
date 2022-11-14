import { NextApiRequest, NextApiResponse } from 'next';
import type { ZoneBase } from '../../../types';
import { createZoneObject } from '../../../utils';
import zones from '../../../data/zones.json';

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const data = await getZones(res);
    res.status(200).json(data);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ statusCode: 500, message: err?.message });
  }
};

async function getZones(res: NextApiResponse) {
  const arr = zones
    .map((item: ZoneBase) => createZoneObject(item))
    .sort((a: any, b: any) => a.id.localeCompare(b.id));

  res.status(200).json(arr);
}

import path from 'path';
import { promises as fs } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { createZoneObject } from '../../../utils';
import type { ZoneBase } from '../../../types';

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const data = await getZones();
    res.status(200).json(data);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ statusCode: 500, message: err?.message });
  }
};

async function getZones() {
  const jsonDirectory = path.join(process.cwd(), 'data');
  const fileContents = await fs.readFile(jsonDirectory + '/zones.json', 'utf8');
  return JSON.parse(fileContents)
    .map((item: ZoneBase) => createZoneObject(item))
    .sort((a: any, b: any) => a?.id?.localeCompare(b.id));
}

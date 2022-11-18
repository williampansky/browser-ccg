import path from 'path';
import { promises as fs } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { CardBase } from '../../../types';
import { createCardObject } from '../../../utils';

const jsonDirectory = path.join(process.cwd(), 'data');

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const core = await getCoreCards();
    const entourage = await getEntourageCards();
    const db = [...core, ...entourage].sort((a: any, b: any) => {
      return a?.id?.localeCompare(b.id);
    });

    res.status(200).json(db);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ statusCode: 500, message: err?.message });
  }
};

async function getCoreCards() {
  const dir = jsonDirectory;
  const fileContents = await fs.readFile(dir + '/setsCore.json', 'utf8');

  return JSON.parse(fileContents).map((item: CardBase) => {
    return createCardObject(item);
  });
}

async function getEntourageCards() {
  const dir = jsonDirectory;
  const fileContents = await fs.readFile(dir + '/setsEntourage.json', 'utf8');

  return JSON.parse(fileContents).map((item: CardBase) => {
    return createCardObject(item);
  });
}

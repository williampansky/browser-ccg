import path from 'path';
import { promises as fs } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { CardBase } from '../../../types';
import { createCardObject } from '../../../utils';

const jsonDirectory = path.join(process.cwd(), 'json');

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const game = await getGameCards();
    const entourage = await getEntourageCards();
    const db = [...game, ...entourage];

    res.status(200).json(db);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ statusCode: 500, message: err?.message });
  }
};

async function getGameCards() {
  const dir = jsonDirectory;
  const fileContents = await fs.readFile(dir + '/setsGame.json', 'utf8');

  return JSON.parse(fileContents)
    .map((item: CardBase) => createCardObject(item))
    .sort((a: any, b: any) => a?.id?.localeCompare(b.id));
}

async function getEntourageCards() {
  const dir = jsonDirectory;
  const fileContents = await fs.readFile(dir + '/setsEntourage.json', 'utf8');

  return JSON.parse(fileContents).map((item: CardBase) => {
    return createCardObject(item);
  });
}

import path from 'path';
import { promises as fs } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { Card, CardBase } from '../../../types';
import { createCardObject } from '../../../utils';

const jsonDirectory = path.join(process.cwd(), 'data');

function sortArray(arr: Card[]) {
  return arr.sort((a: Card, b: Card) => {
    if (a.baseCost > b.baseCost) return 1;
    if (a.baseCost < b.baseCost) return -1;
    if (a.name > b.name) return 1;
    if (a.name < b.name) return -1;
    return 1;
  });
}

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const core = await getCoreCards();
    const entourage = await getEntourageCards();
    const db = sortArray([...core, ...entourage]);
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

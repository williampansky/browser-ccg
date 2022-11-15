import { NextApiRequest, NextApiResponse } from 'next';
import { CardBase, CardId } from '../../../types';
import {
  setsGameTable,
  setsCoreTable,
  setsPrimeTable,
  setsEntourageTable,
} from '../../../airtable';
import { createCardObject } from '../../../utils';
// import setsGame from '../../../json/setsGame.json';
// import setsEntourage from '../../../json/setsEntourage.json';

import path from 'path';
import { promises as fs } from 'fs';
const jsonDirectory = path.join(process.cwd(), 'json');

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const game = await getGameCards();
    const entourage = await getEntourageCards();

    const db = [
      ...game,
      ...entourage
    ]
    // const records = await table.select({}).firstPage();

    // const gameArr = game?.map((obj: CardBase) => createCardObject(obj))

    // const db = {
    //   ...
    // }
    res.status(200).json(db);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ statusCode: 500, message: err?.message });
  }
};

async function getGameCards() {
  const fileContents = await fs.readFile(jsonDirectory + '/setsGame.json', 'utf8');
  return JSON.parse(fileContents).map((item: CardBase) => createCardObject(item));
}

async function getEntourageCards() {
  const fileContents = await fs.readFile(jsonDirectory + '/setsEntourage.json', 'utf8');
  return JSON.parse(fileContents).map((item: CardBase) => createCardObject(item));
}

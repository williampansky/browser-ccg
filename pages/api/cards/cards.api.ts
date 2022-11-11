import { NextApiRequest, NextApiResponse } from 'next';
import { CardBase, CardId } from '../../../types';
import {
  setsGameTable,
  setsCoreTable,
  setsPrimeTable,
  setsEntourageTable,
} from '../../../airtable';
import { createCardObject } from '../../../utils';
import setsGame from '../../../data/setsGame.json';
import setsEntourage from '../../../data/setsEntourage.json';

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const game = await getGameCards(res);
    const entourage = await getEntourageCards(res);

    const db = {
      game,
      entourage
    }
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

async function getGameCards(res: NextApiResponse) {
  const arr = setsGame.map((item: CardBase) => createCardObject(item));
  res.status(200).json(arr);
}

async function getEntourageCards(res: NextApiResponse) {
  const arr = setsEntourage.map((item: CardBase) => createCardObject(item));
  res.status(200).json(arr);
}
